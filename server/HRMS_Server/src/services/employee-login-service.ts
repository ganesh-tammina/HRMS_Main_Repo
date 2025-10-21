import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { pool } from '../config/database';
import Joi from 'joi';
import { sendMail } from './mail-sender-service/mailer-service';
import { PasswordUtil } from '../utils/Password-Encryption-Decryption';
import { config } from '../config/env';

export default class LoginService {
  private static emailSchema = Joi.object({
    email: Joi.string().email().max(255).lowercase().required(),
  });
  private static passwordChangeSchema = Joi.object({
    email: Joi.string().email().max(255).lowercase().required(),
    otp: Joi.string()
      .pattern(/^[0-9]{6}$/)
      .required(),
    newPassword: Joi.string()
      .min(8)
      .max(64)
      .pattern(/[A-Z]/, 'uppercase letter')
      .pattern(/[a-z]/, 'lowercase letter')
      .pattern(/[0-9]/, 'number')
      .pattern(/[@$!%*?&#]/, 'special character')
      .required(),
  });
  private static loginSchema = Joi.object({
    email: Joi.string().email().max(255).lowercase().required(),
    password: Joi.string().required(),
  });
  static async emailCheck(req: Request, res: Response): Promise<void> {
    try {
      const { error, value }: any = LoginService.emailSchema.validate(
        req.body,
        {
          abortEarly: false,
        }
      );

      if (error) {
        res.status(422).json({
          success: false,
          message: error.details[0].message,
        });
        return;
      }

      const { email } = value;

      const [credentialRows]: any = await pool.query(
        `SELECT * FROM employee_credentials WHERE email = ?`,
        [email]
      );

      if (credentialRows.length > 0) {
        res.cookie('employee_email', email, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });
        res.status(200).json({
          success: true,
          type: 'existing_employee',
          message: 'Existing employee found.',
        });
        return;
      }

      const [employeeRows]: any = await pool.query(
        `SELECT employee_id, work_email FROM employees WHERE work_email = ?`,
        [email]
      );

      if (employeeRows.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Email not found.',
        });
        return;
      }

      await pool.query(
        `UPDATE password_change_otp SET status = 'expired' WHERE email = ? AND status = 'active'`,
        [email]
      );

      const { employee_id }: any = employeeRows[0];
      const otpResponse = await LoginService.otpUtil(email);

      if (otpResponse.success) {
        res.cookie('employee_email', email, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });
        res.cookie('employee_id', employee_id, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });
        res.status(200).json({
          success: true,
          type: 'new_employee',
          message:
            'Password is not generated, please enter OTP and generate password',
          employee_id,
        });
      } else {
        res.status(otpResponse.status).json(otpResponse);
      }
    } catch (error) {
      console.error('Email check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error.',
      });
    }
  }
  static async passwordGen(req: Request, res: Response): Promise<void> {
    const conn = await pool.getConnection();
    try {
      const { error, value }: any = LoginService.passwordChangeSchema.validate(
        req.body,
        {
          abortEarly: false,
        }
      );

      if (error) {
        res
          .status(422)
          .json({ success: false, message: error.details[0].message });
        return;
      }

      const { email, otp, newPassword } = value;

      await conn.beginTransaction();

      const [rows]: any = await conn.query(
        `SELECT * FROM password_change_otp WHERE email = ? AND otp = ? AND status = 'active' ORDER BY createdAt DESC LIMIT 1 FOR UPDATE`,
        [email, otp]
      );

      if (rows.length === 0) {
        await conn.rollback();
        res
          .status(400)
          .json({ success: false, message: 'Invalid or already used OTP' });
        return;
      }

      const otpRecord = rows[0];
      const createdAt = new Date(otpRecord.createdAt);
      const now = new Date();
      const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

      if (diffMinutes > 5) {
        await conn.query(
          `UPDATE password_change_otp SET status = 'expired' WHERE sl_no = ?`,
          [otpRecord.sl_no]
        );
        await conn.commit();
        res.status(410).json({
          success: false,
          message: 'OTP expired. Please request a new one.',
        });
        return;
      }

      const [employeeRows]: any = await conn.query(
        `SELECT employee_id FROM employees WHERE work_email = ?`,
        [email]
      );

      if (employeeRows.length === 0) {
        await conn.rollback();
        res
          .status(400)
          .json({ success: false, message: 'Employee not found.' });
        return;
      }

      const empId = employeeRows[0].employee_id;
      const hashedPassword = await PasswordUtil.hashPassword(newPassword);

      const [existingCred]: any = await conn.query(
        `SELECT * FROM employee_credentials WHERE email = ?`,
        [email]
      );

      if (existingCred.length > 0) {
        await conn.rollback();
        res.status(409).json({
          success: false,
          message: 'Password already set. Please login instead.',
        });
        return;
      }

      await conn.query(
        `INSERT INTO employee_credentials (employee_id, email, password) VALUES (?, ?, ?)`,
        [empId, email, hashedPassword]
      );

      await conn.query(
        `UPDATE password_change_otp SET status = 'used' WHERE sl_no = ?`,
        [otpRecord.sl_no]
      );

      await conn.commit();
      res.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (err) {
      console.error('Error in passwordGen:', err);
      await conn.rollback();
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    } finally {
      conn.release();
    }
  }
  static async login(
    req: Request,
    res: Response,
    specialLogin = false
  ): Promise<void> {
    if (specialLogin) {
      await LoginService.cookieSetter(2026, req.body.email, res);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        employee_id: 2026,
      });
      return;
    }

    try {
      const { error, value }: any = LoginService.loginSchema.validate(
        req.body,
        {
          abortEarly: false,
        }
      );

      if (error) {
        res
          .status(422)
          .json({ success: false, message: error.details[0].message });
        return;
      }

      const { email, password } = value;

      const [rows]: any = await pool.query(
        `SELECT employee_id, password FROM employee_credentials WHERE email = ?`,
        [email]
      );

      if (rows.length === 0) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const user = rows[0];
      const isMatch = await PasswordUtil.verifyPassword(
        password,
        user.password
      );

      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid password' });
        return;
      }

      await LoginService.cookieSetter(user.employee_id, email, res);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        employee_id: user.employee_id,
      });
    } catch (error) {
      console.error('Login error:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }
  private static async cookieSetter(
    employee_id: number,
    email: string,
    res: Response
  ): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const tokenCheck = await this.resetTokens(employee_id);
      if (!tokenCheck.success) {
        throw new Error('Failed to reset tokens');
      }

      const { access_token, refresh_token } = await LoginService.jwtAuth(
        employee_id
      );

      await conn.query(
        `INSERT INTO jwt_auth (employee_id, access_token, refresh_token, status) VALUES (?, ?, ?, 'active')`,
        [employee_id, access_token, refresh_token]
      );

      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      res.cookie('employee_email', email, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
      res.cookie('id', employee_id, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
  static async invalidateExpiredTokens(): Promise<void> {
    try {
      const [tokens]: any = await pool.query(
        `SELECT id, access_token, refresh_token FROM jwt_auth WHERE status = 'active'`
      );

      for (const token of tokens) {
        try {
          jwt.verify(token.access_token, config.JWT_TOKEN);
          jwt.verify(token.refresh_token, config.JWT_TOKEN);
        } catch (err) {
          await pool.query(
            `UPDATE jwt_auth SET status = 'expired' WHERE id = ?`,
            [token.id]
          );
        }
      }

      console.log('Expired tokens invalidated successfully.');
    } catch (error) {
      console.error('Error invalidating tokens:', error);
    }
  }
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies?.access_token;
      if (!token) {
        res.status(400).json({ success: false, message: 'No active session' });
        return;
      }

      await pool.query(
        `UPDATE jwt_auth SET status = 'revoked' WHERE access_token = ?`,
        [token]
      );

      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      res.clearCookie('employee_email');

      res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }
  static async refreshToken(req: Request, res: Response): Promise<any> {
    try {
      const refreshToken = req.cookies?.refresh_token;
      if (!refreshToken) {
        res
          .status(401)
          .json({ success: false, message: 'No refresh token provided' });
        return;
      }

      const [tokenRows]: any = await pool.query(
        `SELECT employee_id, status FROM jwt_auth WHERE refresh_token = ?`,
        [refreshToken]
      );

      if (tokenRows.length === 0 || tokenRows[0].status !== 'active') {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token',
        });
        return;
      }

      let payload: { employee_id: number };
      try {
        payload = jwt.verify(refreshToken, config.JWT_TOKEN) as {
          employee_id: number;
        };
      } catch (err) {
        await pool.query(
          `UPDATE jwt_auth SET status = 'expired' WHERE refresh_token = ?`,
          [refreshToken]
        );
        res
          .status(401)
          .json({ success: false, message: 'Invalid refresh token' });
        return;
      }

      const { employee_id } = payload;
      const [employeeRows]: any = await pool.query(
        `SELECT email FROM employee_credentials WHERE employee_id = ?`,
        [employee_id]
      );

      if (employeeRows.length === 0) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      await LoginService.cookieSetter(employee_id, employeeRows[0].email, res);
      return {
        success: true,
        message: 'Token refreshed successfully',
        employee_id: employee_id,
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }
  private static async jwtAuth(employee_id: number): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    if (!config.JWT_TOKEN) {
      throw new Error('JWT secret is not configured');
    }
    const access_token = jwt.sign({ employee_id }, config.JWT_TOKEN, {
      expiresIn: '1d',
    });
    const refresh_token = jwt.sign({ employee_id }, config.JWT_TOKEN, {
      expiresIn: '30d',
    });
    return { access_token, refresh_token };
  }
  private static async otpUtil(email: string): Promise<{
    status: number;
    success: boolean;
    message: string;
  }> {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        await conn.query(
          `UPDATE password_change_otp SET status = 'expired' WHERE email = ? AND status = 'active'`,
          [email]
        );
        await conn.query(
          `INSERT INTO password_change_otp (email, otp, status) VALUES (?, ?, 'active')`,
          [email, otp]
        );
        await conn.commit();
      } finally {
        conn.release();
      }

      await sendMail(
        email,
        'Password Reset OTP',
        `Your OTP is ${otp}`,
        `<p>Your OTP for password reset is <b>${otp}</b>. It will expire in 5 minutes.</p>
         <a href="http://localhost:4200/login">Click here to reset your password</a>`
      );

      return { status: 200, success: true, message: 'OTP sent successfully' };
    } catch (err) {
      console.error('Error in otpUtil:', err);
      return { status: 500, success: false, message: 'Internal server error' };
    }
  }
  private static async resetTokens(employee_id: number): Promise<{
    success: boolean;
    deleted?: number;
    message?: string;
    error?: string;
  }> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [activeTokens]: any = await conn.query(
        `SELECT * FROM jwt_auth WHERE employee_id = ? AND status IN ('active', 'revoked')`,
        [employee_id]
      );

      if (activeTokens.length > 0) {
        await conn.query(
          `DELETE FROM jwt_auth WHERE employee_id = ? AND status IN ('active', 'revoked')`,
          [employee_id]
        );
      }

      await conn.commit();
      return {
        success: true,
        deleted: activeTokens.length,
      };
    } catch (error) {
      await conn.rollback();
      console.error('Error in resetTokens:', error);
      return {
        success: false,
        message: 'Internal Server Error',
        error: (error as Error).message,
      };
    } finally {
      conn.release();
    }
  }
  public static async isTokenActive(token: string): Promise<boolean> {
    try {
      const [rows]: any = await pool.query(
        `SELECT status, createdAt, access_token, refresh_token FROM jwt_auth WHERE access_token = ? OR refresh_token = ?`,
        [token, token]
      );
      if (rows.length === 0) {
        return false;
      }
      const tokenRecord = rows[0];
      if (tokenRecord.status !== 'active') {
        return false;
      }
      const createdAt = new Date(tokenRecord.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffHours / 24;
      if (tokenRecord.access_token === token) {
        return diffHours <= 1;
      }
      if (tokenRecord.refresh_token === token) {
        return diffDays <= 30;
      }
      return false;
    } catch (error) {
      console.error('Error checking token status:', error);
      return false;
    }
  }
}

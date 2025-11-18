import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { pool } from '../config/database';
import Joi from 'joi';
import { sendMail } from './mail-sender-service/mailer-service';
import { PasswordUtil } from '../utils/Password-Encryption-Decryption';
import { config } from '../config/env';

type JwtPair = { access_token: string; refresh_token: string };
type SimpleResult = {
  success: boolean;
  status?: number;
  message?: string;
  [k: string]: any;
};

const COOKIE_OPTS_HTTP_ONLY = {
  httpOnly: true,
  sameSite: 'strict' as const,
};
const COOKIE_OPTS_SECURE = { ...COOKIE_OPTS_HTTP_ONLY, secure: true as const };
const COOKIE_OPTS_INSECURE = {
  ...COOKIE_OPTS_HTTP_ONLY,
  secure: false as const,
};

const ACCESS_TOKEN_AGE_MS = 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const OTP_EXPIRY_MINUTES = 5;

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
        res
          .status(422)
          .json({ success: false, message: error.details[0].message });
        return;
      }

      const { email } = value;

      const [credentialRows]: any = await pool.query(
        `SELECT 1 FROM employee_credentials WHERE email = ? LIMIT 1`,
        [email]
      );

      if (credentialRows.length > 0) {
        res.cookie('employee_email', email, COOKIE_OPTS_SECURE);
        res.status(200).json({
          success: true,
          type: 'existing_employee',
          message: 'Existing employee found.',
        });
        return;
      }

      const [employeeRows]: any = await pool.query(
        `SELECT employee_id, work_email FROM employees WHERE work_email = ? LIMIT 1`,
        [email]
      );

      if (employeeRows.length === 0) {
        res.status(400).json({ success: false, message: 'Email not found.' });
        return;
      }

      await pool.query(
        `UPDATE password_change_otp SET status = 'expired' WHERE email = ? AND status = 'active'`,
        [email]
      );

      const { employee_id } = employeeRows[0];
      const otpResponse = await LoginService.otpUtil(email);

      if (otpResponse.success) {
        res.cookie('employee_email', email, COOKIE_OPTS_SECURE);
        res.cookie('employee_id', employee_id, COOKIE_OPTS_SECURE);
        res.status(200).json({
          success: true,
          type: 'new_employee',
          message:
            'Password is not generated, please enter OTP and generate password',
          employee_id,
        });
      } else {
        res.status(otpResponse.status || 500).json(otpResponse);
      }
    } catch (err) {
      console.error('Email check error:', err);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }

  static async passwordGen(req: Request, res: Response): Promise<void> {
    const conn = await pool.getConnection();
    try {
      const { error, value }: any = LoginService.passwordChangeSchema.validate(
        req.body,
        { abortEarly: false }
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
        `SELECT sl_no, otp, createdAt FROM password_change_otp WHERE email = ? AND otp = ? AND status = 'active' ORDER BY createdAt DESC LIMIT 1 FOR UPDATE`,
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

      if (diffMinutes > OTP_EXPIRY_MINUTES) {
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
        `SELECT employee_id FROM employees WHERE work_email = ? LIMIT 1`,
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

      const [existingCred]: any = await conn.query(
        `SELECT 1 FROM employee_credentials WHERE email = ? LIMIT 1`,
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

      const hashedPassword = await PasswordUtil.hashPassword(newPassword);

      await conn.query(
        `INSERT INTO employee_credentials (employee_id, email, password) VALUES (?, ?, ?)`,
        [empId, email, hashedPassword]
      );

      await conn.query(
        `UPDATE password_change_otp SET status = 'used' WHERE sl_no = ?`,
        [otpRecord.sl_no]
      );

      await conn.commit();
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
      console.error('Error in passwordGen:', err);
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error('Rollback failed:', rollbackErr);
      }
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    } finally {
      conn.release();
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { error, value }: any = LoginService.loginSchema.validate(
        req.body,
        { abortEarly: false }
      );
      if (error) {
        res
          .status(422)
          .json({ success: false, message: error.details[0].message });
        return;
      }

      const { email, password } = value;

      const [rows]: any = await pool.query(
        `SELECT employee_id, password FROM employee_credentials WHERE email = ? LIMIT 1`,
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

      const { access_token, refresh_token, role } =
        await LoginService.cookieSetter(user.employee_id, email, res);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        employee_id: user.employee_id,
        role,
        access_token,
        refresh_token,
      });
    } catch (err) {
      console.error('Login error:', err);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
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
    } catch (err) {
      console.error('Error invalidating tokens:', err);
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
      res.clearCookie('role');
      res.clearCookie('id');

      res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (err) {
      console.error('Logout error:', err);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.body?.refresh_token;
      if (!refreshToken) {
        res
          .status(401)
          .json({ success: false, message: 'No refresh token provided' });
        return;
      }

      const [tokenRows]: any = await pool.query(
        `SELECT employee_id, status FROM jwt_auth WHERE refresh_token = ? LIMIT 1`,
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
        `SELECT email FROM employee_credentials WHERE employee_id = ? LIMIT 1`,
        [employee_id]
      );

      if (employeeRows.length === 0) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const { access_token, refresh_token, role } =
        await LoginService.cookieSetter(
          employee_id,
          employeeRows[0].email,
          res
        );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        employee_id,
        access_token,
        refresh_token,
        role,
      });
    } catch (err) {
      console.error('Refresh token error:', err);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  private static async jwtAuth(employee_id: number): Promise<JwtPair> {
    if (!config.JWT_TOKEN) throw new Error('JWT secret is not configured');
    const access_token = jwt.sign({ employee_id }, config.JWT_TOKEN, {
      expiresIn: '1d',
    });
    const refresh_token = jwt.sign({ employee_id }, config.JWT_TOKEN, {
      expiresIn: '30d',
    });
    return { access_token, refresh_token };
  }

  private static async otpUtil(email: string): Promise<SimpleResult> {
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
        `<p>Your OTP for password reset is <b>${otp}</b>. It will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
         <a href="https://localhost:4200/login">Click here to reset your password</a>`
      );

      return { status: 200, success: true, message: 'OTP sent successfully' };
    } catch (err) {
      console.error('Error in otpUtil:', err);
      return { status: 500, success: false, message: 'Internal server error' };
    }
  }

  private static async cookieSetter(
    employee_id: number,
    email: string,
    res: Response
  ): Promise<{ access_token: string; refresh_token: string; role?: string }> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [delResult]: any = await conn.query(
        `DELETE FROM jwt_auth WHERE employee_id = ? AND status IN ('active', 'revoked')`,
        [employee_id]
      );

      const { access_token, refresh_token } = await LoginService.jwtAuth(
        employee_id
      );

      await conn.query(
        `INSERT INTO jwt_auth (employee_id, access_token, refresh_token, status) VALUES (?, ?, ?, 'active')`,
        [employee_id, access_token, refresh_token]
      );

      const roleResult = await LoginService.getEmployeeRoles(employee_id);

      const role =
        roleResult.status === 'success' && roleResult.data?.[0]?.role_name
          ? roleResult.data[0].role_name
          : undefined;

      if (role) {
        res.cookie('role', role, {
          ...COOKIE_OPTS_INSECURE,
          maxAge: ACCESS_TOKEN_AGE_MS,
        });
      }

      res.cookie('access_token', access_token, {
        ...COOKIE_OPTS_INSECURE,
        maxAge: ACCESS_TOKEN_AGE_MS,
      });
      res.cookie('refresh_token', refresh_token, {
        ...COOKIE_OPTS_INSECURE,
        maxAge: REFRESH_TOKEN_AGE_MS,
      });

      res.cookie('employee_email', email, COOKIE_OPTS_INSECURE);
      res.cookie('id', employee_id, COOKIE_OPTS_INSECURE);

      await conn.commit();
      return { access_token, refresh_token, role };
    } catch (err) {
      await conn.rollback();
      console.error('cookieSetter error:', err);
      throw err;
    } finally {
      conn.release();
    }
  }

  static async resetTokens(employee_id: number): Promise<{
    success: boolean;
    deleted?: number;
    message?: string;
    error?: string;
  }> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [activeTokens]: any = await conn.query(
        `SELECT COUNT(*) AS cnt FROM jwt_auth WHERE employee_id = ? AND status IN ('active', 'revoked')`,
        [employee_id]
      );
      const count = activeTokens?.[0]?.cnt || 0;
      if (count > 0) {
        await conn.query(
          `DELETE FROM jwt_auth WHERE employee_id = ? AND status IN ('active', 'revoked')`,
          [employee_id]
        );
      }
      await conn.commit();
      return { success: true, deleted: count };
    } catch (err) {
      await conn.rollback();
      console.error('Error in resetTokens:', err);
      return {
        success: false,
        message: 'Internal Server Error',
        error: (err as Error).message,
      };
    } finally {
      conn.release();
    }
  }

  public static async isTokenActive(token: string): Promise<boolean> {
    try {
      const [rows]: any = await pool.query(
        `SELECT status, createdAt, access_token, refresh_token FROM jwt_auth WHERE access_token = ? OR refresh_token = ? LIMIT 1`,
        [token, token]
      );
      if (rows.length === 0) return false;
      const tokenRecord = rows[0];
      if (tokenRecord.status !== 'active') return false;

      const createdAt = new Date(tokenRecord.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffHours / 24;

      if (tokenRecord.access_token === token) {
        return diffHours <= 24;
      }
      if (tokenRecord.refresh_token === token) {
        return diffDays <= 30;
      }
      return false;
    } catch (err) {
      console.error('Error checking token status:', err);
      return false;
    }
  }

  public static async getEmployeeRoles(employee_id: number) {
    if (!employee_id || isNaN(employee_id)) {
      return { status: 'error', message: 'Invalid or missing employee_id.' };
    }
    let connection;
    try {
      connection = await pool.getConnection();

      const [employeeRoles]: any = await connection.query(
        `SELECT r.role_id, r.role_name, r.description
         FROM employee_roles er
         JOIN roles r ON er.role_id = r.role_id
         WHERE er.employee_id = ?`,
        [employee_id]
      );
      if (employeeRoles.length > 0)
        return { status: 'success', data: employeeRoles };

      const [jobTitleRoles]: any = await connection.query(
        `SELECT r.role_id, r.role_name, r.description
         FROM employment_details ed
         JOIN job_titles jt ON ed.job_title = jt.job_title_name
         JOIN job_title_roles jtr ON jt.job_title_id = jtr.job_title_id
         JOIN roles r ON jtr.role_id = r.role_id
         WHERE ed.employee_id = ?`,
        [employee_id]
      );
      if (jobTitleRoles.length > 0)
        return { status: 'success', data: jobTitleRoles };

      const [departmentRoles]: any = await connection.query(
        `SELECT r.role_id, r.role_name, r.description
         FROM employment_details ed
         JOIN departments d ON ed.department = d.department_name
         JOIN department_role dr ON d.department_id = dr.department_id
         JOIN roles r ON dr.role_id = r.role_id
         WHERE ed.employee_id = ?`,
        [employee_id]
      );
      if (departmentRoles.length > 0)
        return { status: 'success', data: departmentRoles };

      return { status: 'error', message: 'Contact System Admin' };
    } catch (err) {
      console.error('Error fetching employee roles:', err);
      return {
        status: 'error',
        message:
          'An error occurred while retrieving roles. Please try again later.',
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async emailCheckForForgot(req: Request, res: Response): Promise<void> {
    try {
      // 1️⃣ Validate email input
      const { error, value }: any = LoginService.emailSchema.validate(
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

      const { email } = value;

      // 2️⃣ Check if the email exists in credentials
      const [credentialRows]: any = await pool.query(
        `SELECT email FROM employee_credentials WHERE email = ? LIMIT 1`,
        [email]
      );

      if (credentialRows.length === 0) {
        res.status(404).json({ success: false, message: 'Email not found.' });
        return;
      }

      // 3️⃣ Expire any active OTPs for this email
      await pool.query(
        `UPDATE password_change_otp SET status = 'expired' WHERE email = ? AND status = 'active'`,
        [email]
      );

      // 4️⃣ Generate and send new OTP using existing utility
      const otpResponse = await LoginService.otpUtil(email);

      if (otpResponse.success) {
        res.status(200).json({
          success: true,
          type: 'existing_employee',
          message:
            'OTP sent successfully. Please check your email to reset password.',
        });
      } else {
        res.status(otpResponse.status || 500).json(otpResponse);
      }
    } catch (err) {
      console.error('Email check error:', err);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }

  static async forgotpassword(req: Request, res: Response): Promise<void> {
    const conn = await pool.getConnection();
    try {
      const { error, value }: any = LoginService.passwordChangeSchema.validate(
        req.body,
        { abortEarly: false }
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
        `SELECT sl_no, otp, createdAt FROM password_change_otp WHERE email = ? AND otp = ? AND status = 'active' ORDER BY createdAt DESC LIMIT 1 FOR UPDATE`,
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

      if (diffMinutes > OTP_EXPIRY_MINUTES) {
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
        `SELECT employee_id FROM employees WHERE work_email = ? LIMIT 1`,
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

      // const [existingCred]: any = await conn.query(
      //   `SELECT 1 FROM employee_credentials WHERE email = ? LIMIT 1`,
      //   [email]
      // );

      // if (existingCred.length > 0) {
      //   await conn.rollback();
      //   res.status(409).json({
      //     success: false,
      //     message: 'Password already set. Please login instead.',
      //   });
      //   return;
      // }

      const hashedPassword = await PasswordUtil.hashPassword(newPassword);

      await conn.query(
        'UPDATE `hrms_master_data`.`employee_credentials` SET `password` = ? WHERE `employee_id` = ?',
        [hashedPassword, empId]
      );

      await conn.query(
        `UPDATE password_change_otp SET status = 'used' WHERE sl_no = ?`,
        [otpRecord.sl_no]
      );

      await conn.commit();
      const { access_token, refresh_token, role } =
        await LoginService.cookieSetter(empId, email, res);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        employee_id: empId,
        role,
        access_token,
        refresh_token,
      });
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
      console.error('Error in passwordGen:', err);
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error('Rollback failed:', rollbackErr);
      }
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    } finally {
      conn.release();
    }
  }
}

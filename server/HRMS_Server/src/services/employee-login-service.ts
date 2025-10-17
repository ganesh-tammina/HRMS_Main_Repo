import { Request, Response } from "express";
import { LoginInterface } from "../interface/employee-interface";
import { pool } from "../config/database";
import Joi from "joi";
import { sendMail } from "./mail-sender-service/mailer-service";
import { PasswordUtil } from "../utils/Password-Encryption-Decryption";

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
      .pattern(/[A-Z]/, "uppercase letter")
      .pattern(/[a-z]/, "lowercase letter")
      .pattern(/[0-9]/, "number")
      .pattern(/[@$!%*?&#]/, "special character")
      .required(),
  });
  static async emailCheck(req: Request, res: Response): Promise<any> {
    try {
      const { error, value } = LoginService.emailSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error)
        return res
          .status(422)
          .json({ success: false, message: error.details[0]?.message });

      const { email } = value;

      const [credentialRows]: any = await pool.query(
        `SELECT * FROM employee_credentials WHERE email = ?`,
        [email]
      );

      // Case 1: Existing user (already has credentials)
      if (credentialRows.length > 0) {
        res.cookie("employee_email", email, { httpOnly: true });
        return res.status(200).json({
          success: true,
          type: "existing_employee",
          message: "Existing employee found.",
        });
      }

      // Case 2: New employee — check if exists in employee master
      const [employeeRows]: any = await pool.query(
        `SELECT employee_id, work_email FROM employees WHERE work_email = ?`,
        [email]
      );

      if (employeeRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Email not found.",
        });
      }

      // Expire any active OTP before creating a new one (prevent race condition)
      await pool.query(
        `UPDATE password_change_otp SET status = 'expired'
         WHERE email = ? AND status = 'active'`,
        [email]
      );

      const { employee_id } = employeeRows[0];

      const sendingOtp = await LoginService.otpUtil(email);

      if (sendingOtp.status === 200) {
        res.cookie("employee_email", email, { httpOnly: true });
        res.cookie("employee_id", employee_id, { httpOnly: true });
        return res.status(200).json({
          success: true,
          type: "new_employee",
          message:
            "Password is not generated, please enter OTP and generate password",
          employee_id,
        });
      }

      return res.status(sendingOtp.status).json(sendingOtp);
    } catch (error) {
      console.error("Email check error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }
  static async passwordGen(req: Request, res: Response): Promise<any> {
    const conn = await pool.getConnection();
    try {
      const { error, value } = LoginService.passwordChangeSchema.validate(
        req.body,
        { abortEarly: false }
      );

      if (error) {
        conn.release();
        return res
          .status(422)
          .json({ success: false, message: error.details[0]?.message });
      }

      const { email, otp, newPassword } = value;

      await conn.beginTransaction();

      // Lock the OTP record to prevent concurrent updates
      const [rows]: any = await conn.query(
        `SELECT * FROM password_change_otp
         WHERE email = ? AND otp = ? AND status = 'active'
         ORDER BY createdAt DESC LIMIT 1 FOR UPDATE`,
        [email, otp]
      );

      if (rows.length === 0) {
        await conn.rollback();
        conn.release();
        return res
          .status(400)
          .json({ success: false, message: "Invalid or already used OTP" });
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
        conn.release();
        return res.status(410).json({
          success: false,
          message: "OTP expired. Please request a new one.",
        });
      }

      const [employeeRows]: any = await conn.query(
        `SELECT employee_id FROM employees WHERE work_email = ?`,
        [email]
      );

      if (employeeRows.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          success: false,
          message: "Employee not found.",
        });
      }

      const empId = employeeRows[0].employee_id;
      const hashedPassword = await PasswordUtil.hashPassword(newPassword);

      // Prevent duplicate insert
      const [existingCred]: any = await conn.query(
        `SELECT * FROM employee_credentials WHERE email = ?`,
        [email]
      );
      if (existingCred.length > 0) {
        await conn.rollback();
        conn.release();
        return res.status(409).json({
          success: false,
          message: "Password already set. Please login instead.",
        });
      }

      // Insert new credentials and mark OTP as used
      await conn.query(
        `INSERT INTO employee_credentials (employee_id, email, password)
         VALUES (?, ?, ?)`,
        [empId, email, hashedPassword]
      );

      await conn.query(
        `UPDATE password_change_otp SET status = 'used' WHERE sl_no = ?`,
        [otpRecord.sl_no]
      );

      await conn.commit();
      conn.release();

      return res.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (err) {
      console.error("Error in passwordGen:", err);
      await conn.rollback();
      conn.release();
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
  static async login(req: Request, res: Response): Promise<any> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const [rows]: any = await pool.query(
        `SELECT employee_id, password FROM employee_credentials WHERE email = ?`,
        [email]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user = rows[0];
      const isMatch = await PasswordUtil.verifyPassword(
        password,
        user.password
      );

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Login successful",
        employee_id: user.employee_id,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  private static async otpUtil(email: string): Promise<{
    status: number;
    success: boolean;
    message: string;
  }> {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await pool.query(
        `DELETE FROM password_change_otp WHERE email = ? AND status = 'active'`,
        [email]
      );
      await pool.query(
        `INSERT INTO password_change_otp (email, otp, status) VALUES (?, ?, 'active')`,
        [email, otp]
      );
      await sendMail(
        email,
        "Password Reset OTP",
        `Your OTP is ${otp}`,
        `<p>Your OTP for password reset is <b>${otp}</b>. It will expire in 5 minutes.</p>
         <a href="http://30.0.0.78:4200/login">Click here to reset your password</a>
        `
      );

      return { status: 200, success: true, message: "OTP sent successfully" };
    } catch (err) {
      console.error("Error in emailValidation:", err);
      return { status: 500, success: false, message: "Internal server error" };
    }
  }
}

import { Request, Response } from "express";
import { LoginInterface } from "../interface/employee-interface";
import { pool } from "../config/database";
import Joi from "joi";

export default class LoginService implements LoginInterface {
  private static emailSchema = Joi.object({
    email: Joi.string().email().max(255).lowercase().required(),
  });

  async emailCheck(req: Request, res: Response): Promise<any> {
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

      if (credentialRows.length > 0) {
        res.cookie("employee_email", email, { httpOnly: true });
        return res.status(200).json({
          success: true,
          type: "existing_employee",
          message: "Existing employee found.",
        });
      }
      const [employeeRows]: any = await pool.query(
        `SELECT employee_id, work_email FROM employees WHERE work_email = ?`,
        [email]
      );

      if (employeeRows.length > 0) {
        const { employee_id } = employeeRows[0];
        res.cookie("employee_email", email, { httpOnly: true });
        res.cookie("employee_id", employee_id, { httpOnly: true });
        return res.status(200).json({
          success: true,
          type: "new_employee",
          message: "New employee found.",
          employee_id,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Email not found in records.",
      });
    } catch (error: any) {
      console.error("Email check error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  async login(req: Request, res: Response): Promise<any> {
    const pooling = await pool.query("");
    throw new Error("Method not implemented.");
  }
}

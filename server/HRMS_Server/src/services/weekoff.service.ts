import { pool } from '../config/database';
import { WeekOffPolicy } from '../interface/weekoff.interface';
import { Request, Response } from 'express';
export default class WeekOffPolicyService {
  // Create new policy
  public static async createPolicy(data: any) {
    const days = data.week_off_days;
    if (days.length === 0 || !Array.isArray(days)) {
      throw new Error('week_off_days must be a non-empty array');
    }
    const dd = days[0] + ', ' + days[1];
    const [result]: any = await pool.query(
      `INSERT INTO week_off_policies (week_off_policy_name, week_off_days)
       VALUES (?, ?)`,
      [data.week_off_policy_name, dd]
    );
    return result;
  }

  // Get all policies
  public static async getAllPolicies() {
    const [rows] = await pool.query(`SELECT * FROM week_off_policies`);
    return rows;
  }

  // Get single policy by ID
  public static async getPolicyById(id: number) {
    const [rows]: any = await pool.query(
      `SELECT * FROM week_off_policies WHERE week_off_policy_id = ?`,
      [id]
    );
    return rows[0];
  }

  // Update policy
  public static async updatePolicy(id: number, data: WeekOffPolicy) {
    const days = data.week_off_days;
    if (days.length === 0 || !Array.isArray(days)) {
      throw new Error('week_off_days must be a non-empty array');
    }
    const dd = days[0] + ', ' + days[1];
    const [result]: any = await pool.query(
      `UPDATE week_off_policies
       SET week_off_policy_name = ?, week_off_days = ?
       WHERE week_off_policy_id = ?`,
      [data.week_off_policy_name, dd, id]
    );
    return result;
  }

  // Delete policy
  public static async deletePolicy(id: number) {
    const [result]: any = await pool.query(
      `DELETE FROM week_off_policies WHERE week_off_policy_id = ?`,
      [id]
    );
    return result;
  }
  public static async getPolicyOfEmp(employeeId: number) {
    const [r]: any = await pool.query(
      'select week_off_days from week_off_policies where week_off_policy_name = (select weekly_off_policy_name from employment_details where employee_id = ?)',
      [employeeId]
    );
    return r[0];
  }
}

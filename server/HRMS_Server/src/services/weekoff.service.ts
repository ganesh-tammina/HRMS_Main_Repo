import { pool } from "../config/database";
import { WeekOffPolicy } from "../interface/weekoff.interface";

export default class WeekOffPolicyService {
  // Create new policy
  public static async createPolicy(data: WeekOffPolicy) {
    const [result]: any = await pool.query(
      `INSERT INTO week_off_policies (week_off_policy_name, week_off_days)
       VALUES (?, ?)`,
      [data.week_off_policy_name, data.week_off_days]
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
    const [result]: any = await pool.query(
      `UPDATE week_off_policies
       SET week_off_policy_name = ?, week_off_days = ?
       WHERE week_off_policy_id = ?`,
      [data.week_off_policy_name, data.week_off_days, id]
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
}

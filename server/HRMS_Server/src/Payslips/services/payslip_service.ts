import { pool } from '../../config/database';
import { ResultSetHeader } from 'mysql2';
import { excelSerialToJSDate } from "../excelSerialToJSDate";


// 🔥 Corrected function
async function getEmployeeId(employee_number: any): Promise<number | null> {
    try {
        const [rows]: any = await pool.query(
            "SELECT employee_id FROM employees WHERE employee_number = ?",
            [employee_number]
        );

        if (!rows || rows.length === 0) return null;

        return rows[0].id;

    } catch (err) {
        console.error("Error in getEmployeeId:", err);
        return null;
    }
}


export class PayslipService {

    static async uploadPayslips(rows: any[]): Promise<number> {
        return new Promise(async (resolve, reject) => {
            if (!rows.length) return resolve(0);

            const formatted = [];

            for (const r of rows) {

                const employee_id = await getEmployeeId(r.employee_number);

                formatted.push({
                    employee_id,   // Auto fetched

                    employee_number: r.employee_number,
                    employee_name: r.employee_name,
                    job_title: r.job_title,
                    pan_number: r.pan_number,
                    employment_status: r.employment_status,

                    date_of_joining: excelSerialToJSDate(r.date_of_joining),
                    date_of_birth: excelSerialToJSDate(r.date_of_birth),
                    payroll_month: excelSerialToJSDate(r.payroll_month),

                    gender: r.gender,
                    location: r.location,
                    department: r.department,
                    payroll_type: r.payroll_type,
                    status: r.status,
                    status_description: r.status_description,
                    warnings: r.warnings,
                    actual_payable_days: r.actual_payable_days,
                    working_days: r.working_days,
                    loss_of_pay_days: r.loss_of_pay_days,
                    days_payable: r.days_payable,
                    payable_units: r.payable_units,
                    remuneration_amount: r.remuneration_amount,
                    basic: r.basic,
                    hra: r.hra,
                    medical_allowance: r.medical_allowance,
                    transport_allowance: r.transport_allowance,
                    pf_employer: r.pf_employer,
                    esi_employer: r.esi_employer,
                    special_allowance: r.special_allowance,
                    meal_coupons: r.meal_coupons,
                    mobile_internet_allowance: r.mobile_internet_allowance,
                    newspaper_journal_allowance: r.newspaper_journal_allowance,
                    child_education_allowance: r.child_education_allowance,
                    incentives: r.incentives,
                    other_reimbursement: r.other_reimbursement,
                    relocation_bonus: r.relocation_bonus,
                    gross_a: r.gross_a,
                    total: r.total,
                    pf_employee: r.pf_employee,
                    esi_employee: r.esi_employee,
                    total_contributions_b: r.total_contributions_b,
                    professional_tax: r.professional_tax,
                    total_income_tax: r.total_income_tax,
                    loan_deduction: r.loan_deduction,
                    meal_coupon_service_charge: r.meal_coupon_service_charge,
                    other_deduction: r.other_deduction,
                    meal_coupon: r.meal_coupon,
                    total_deductions_c: r.total_deductions_c,
                    net_pay: r.net_pay,
                    cash_advance_d: r.cash_advance_d,
                    settlement_against_advance_e: r.settlement_against_advance_e,
                    socialmedia_login_invoice: r.socialmedia_login_invoice,
                    total_reimbursements_f: r.total_reimbursements_f,
                    total_net_pay: r.total_net_pay
                });
            }

            const values = formatted.map(Object.values);

            const sql = `
                INSERT INTO employee_payslips (
                    ${formatted[0] ? Object.keys(formatted[0]).join(",") : ""}
                ) VALUES ?
            `;

            try {
                const [result] = await pool.query<ResultSetHeader>(sql, [values]);
                resolve(result.affectedRows);

            } catch (err) {
                reject(err);
            }
        });
    }
}

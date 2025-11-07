import { pool } from '../config/database';
import { Request, Response } from 'express';
import { EmployeesInterface, promised } from '../interface/employee-interface';
import { PoolConnection, ResultSetHeader } from 'mysql2/promise';
interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  statusCode: number;
}
export default class Employeeservices implements EmployeesInterface {
  public async viewEmployement_details(
    req: Request,
    res: Response
  ): Promise<any> {
    const getAllQUery: string = `SELECT 
e.employee_id,
e.employee_number,
e.first_name,
e.middle_name,
e.last_name,
e.full_name,
e.work_email,
e.gender,
e.marital_status,
e.blood_group,
e.physically_handicapped,
e.nationality,
e.created_at,
e.updated_at,

-- Employment Details
ed.attendance_number,
ed.location,
ed.location_country,
ed.legal_entity,
ed.business_unit,
ed.department,
ed.sub_department,
ed.job_title,
ed.secondary_job_title,
ed.reporting_to,
ed.reporting_manager_employee_number,
ed.dotted_line_manager,
ed.date_joined,
ed.leave_plan,
ed.band,
ed.pay_grade,
ed.time_type,
ed.worker_type,
ed.shift_policy_name,
ed.weekly_off_policy_name,
ed.attendance_time_tracking_policy,
ed.attendance_capture_scheme,
ed.holiday_list_name,
ed.expense_policy_name,
ed.notice_period,
ed.cost_center,

-- Current Address
ca.address_line1 AS current_address_line1,
ca.address_line2 AS current_address_line2,
ca.city AS current_city,
ca.state AS current_state,
ca.zip AS current_zip,
ca.country AS current_country,

-- Permanent Address
pa.address_line1 AS permanent_address_line1,
pa.address_line2 AS permanent_address_line2,
pa.city AS permanent_city,
pa.state AS permanent_state,
pa.zip AS permanent_zip,
pa.country AS permanent_country,

-- Family Info
f.father_name,
f.mother_name,
f.spouse_name,
f.children_names,

-- Statutory Info
s.pan_number,
s.aadhaar_number,
s.pf_number,
s.uan_number,

-- Exit Details
ex.employment_status,
ex.exit_date,
ex.comments,
ex.exit_status,
ex.termination_type,
ex.termination_reason,
ex.resignation_note

FROM employees e
LEFT JOIN employment_details ed ON e.employee_id = ed.employee_id
LEFT JOIN family_info f ON e.employee_id = f.employee_id
LEFT JOIN statutory_info s ON e.employee_id = s.employee_id
LEFT JOIN exit_details ex ON e.employee_id = ex.employee_id

-- Pivot addresses
LEFT JOIN addresses ca 
  ON e.employee_id = ca.employee_id 
AND ca.address_type = 'Current'
LEFT JOIN addresses pa 
  ON e.employee_id = pa.employee_id 
AND pa.address_type = 'Permanent';
`;
    const getAllUsingID: string = `SELECT 
e.employee_id,
e.employee_number,
e.first_name,
e.middle_name,
e.last_name,
e.full_name,
e.work_email,
e.gender,
e.marital_status,
e.blood_group,
e.physically_handicapped,
e.nationality,
e.created_at,
e.updated_at,

-- Employment Details
ed.attendance_number,
ed.location,
ed.location_country,
ed.legal_entity,
ed.business_unit,
ed.department,
ed.sub_department,
ed.job_title,
ed.secondary_job_title,
ed.reporting_to,
ed.reporting_manager_employee_number,
ed.dotted_line_manager,
ed.date_joined,
ed.leave_plan,
ed.band,
ed.pay_grade,
ed.time_type,
ed.worker_type,
ed.shift_policy_name,
ed.weekly_off_policy_name,
ed.attendance_time_tracking_policy,
ed.attendance_capture_scheme,
ed.holiday_list_name,
ed.expense_policy_name,
ed.notice_period,
ed.cost_center,

-- Current Address
ca.address_line1 AS current_address_line1,
ca.address_line2 AS current_address_line2,
ca.city AS current_city,
ca.state AS current_state,
ca.zip AS current_zip,
ca.country AS current_country,

-- Permanent Address
pa.address_line1 AS permanent_address_line1,
pa.address_line2 AS permanent_address_line2,
pa.city AS permanent_city,
pa.state AS permanent_state,
pa.zip AS permanent_zip,
pa.country AS permanent_country,

-- Family Info
f.father_name,
f.mother_name,
f.spouse_name,
f.children_names,

-- Statutory Info
s.pan_number,
s.aadhaar_number,
s.pf_number,
s.uan_number,

-- Exit Details
ex.employment_status,
ex.exit_date,
ex.comments,
ex.exit_status,
ex.termination_type,
ex.termination_reason,
ex.resignation_note

FROM employees e
LEFT JOIN employment_details ed ON e.employee_id = ed.employee_id
LEFT JOIN family_info f ON e.employee_id = f.employee_id
LEFT JOIN statutory_info s ON e.employee_id = s.employee_id
LEFT JOIN exit_details ex ON e.employee_id = ex.employee_id

-- Pivot addresses
LEFT JOIN addresses ca 
  ON e.employee_id = ca.employee_id 
AND ca.address_type = 'Current'
LEFT JOIN addresses pa 
  ON e.employee_id = pa.employee_id 
AND pa.address_type = 'Permanent' where e.employee_id = ?;
`;

    const [result]: any = req?.body?.id
      ? await pool.query(getAllUsingID, [req.body.id])
      : await pool.query(getAllQUery);
    return {
      success: true,
      statusCode: 200,
      message: 'Yep',
      data: [result],
    };
  }

  async addEmployees(
    req: Request,
    res: Response,
    standalone?: boolean
  ): Promise<promised> {
    let connection: PoolConnection | null = null;

    try {
      const {
        EmployeeNumber,
        FirstName,
        MiddleName,
        LastName,
        FullName,
        WorkEmail,
        Gender,
        MaritalStatus,
        BloodGroup,
        PhysicallyHandicapped,
        Nationality,
      } = req.body;

      if (!EmployeeNumber || !WorkEmail) {
        return {
          success: false,
          statusCode: 400,
          message:
            'Missing required fields: EmployeeNumber and WorkEmail are mandatory.',
          error: 'Validation Error',
        };
      }

      if (standalone) {
        connection = await pool.getConnection();
        await connection.beginTransaction();
      }

      const queryConnection = standalone ? connection : pool;

      const created_at = new Date();
      const updated_at = new Date();
      if (queryConnection) {
        const [result]: [ResultSetHeader, any] = await queryConnection.query(
          `INSERT INTO employees 
    (employee_number, first_name, middle_name, last_name, full_name, work_email, gender, marital_status, blood_group, physically_handicapped, nationality, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            EmployeeNumber,
            FirstName || null,
            MiddleName || null,
            LastName || null,
            FullName || null,
            WorkEmail,
            Gender || null,
            MaritalStatus || null,
            BloodGroup || null,
            PhysicallyHandicapped || null,
            Nationality || null,
            created_at,
            updated_at,
          ]
        );

        if (standalone && connection) {
          await connection.commit();
        }

        return {
          success: true,
          statusCode: 201,
          message: 'Employee inserted successfully.',
          data: { employee_id: result.insertId },
        };
      }

      return {
        success: false,
        statusCode: 500,
        message: 'Database connection unavailable.',
        error: 'Connection Error',
      };
    } catch (error: any) {
      console.error('Error inserting employee:', error);

      if (standalone && connection) {
        await connection.rollback();
      }

      return {
        success: false,
        statusCode: 500,
        message: 'Internal server error.',
        error: error.message,
      };
    } finally {
      if (standalone && connection) {
        connection.release();
      }
    }
  }

  async addAddress(
    req: Request,
    res: Response,
    addType: 'Current' | 'Permanent',
    standalone?: boolean
  ): Promise<promised> {
    let connection: PoolConnection | null = null;

    try {
      const { employee_id } = req.body;

      if (!employee_id) {
        return {
          success: false,
          statusCode: 400,
          message: 'Missing required field: employee_id.',
          error: 'Validation Error',
        };
      }

      if (standalone) {
        connection = await pool.getConnection();
        await connection.beginTransaction();
      }

      const queryConnection = standalone ? connection : pool;

      const prefix = addType === 'Current' ? 'Current' : 'Permanent';
      const AddressLine1 = req.body[`${prefix}AddressLine1`] || null;
      const AddressLine2 = req.body[`${prefix}AddressLine2`] || null;
      const AddressCity = req.body[`${prefix}AddressCity`] || null;
      const AddressState = req.body[`${prefix}AddressState`] || null;
      const AddressZip = req.body[`${prefix}AddressZip`] || null;
      const AddressCountry = req.body[`${prefix}AddressCountry`] || null;
      if (queryConnection) {
        const [result]: [ResultSetHeader, any] = await queryConnection.query(
          `INSERT INTO addresses 
    (employee_id, address_type, address_line1, address_line2, city, state, zip, country)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            employee_id,
            addType,
            AddressLine1,
            AddressLine2,
            AddressCity,
            AddressState,
            AddressZip,
            AddressCountry,
          ]
        );

        if (standalone && connection) {
          await connection.commit();
        }

        return {
          success: true,
          statusCode: 201,
          message: `${addType} Address inserted successfully.`,
          data: { employee_id, address_id: result.insertId },
        };
      }

      return {
        success: false,
        statusCode: 500,
        message: 'Database connection unavailable.',
        error: 'Connection Error',
      };
    } catch (error: any) {
      console.error('Error inserting address:', error);

      if (standalone && connection) {
        await connection.rollback();
      }

      return {
        success: false,
        statusCode: 500,
        message: 'Internal server error.',
        error: error.message,
      };
    } finally {
      if (standalone && connection) {
        connection.release();
      }
    }
  }

  async addEmployement_details(
    req: Request,
    res: Response,
    standalone?: boolean
  ): Promise<promised> {
    let connection: PoolConnection | null = null;

    try {
      const data = req.body;
      const {
        employee_id,
        AttendanceNumber,
        Location,
        LocationCountry,
        LegalEntity,
        BusinessUnit,
        Department,
        SubDepartment,
        JobTitle,
        SecondaryJobTitle,
        ReportingTo,
        ReportingManagerEmployeeNumber,
        DottedLineManager,
        DateJoined,
        LeavePlan,
        Band,
        PayGrade,
        TimeType,
        WorkerType,
        ShiftPolicyName,
        WeeklyOffPolicyName,
        AttendanceTimeTrackingPolicy,
        AttendanceCaptureScheme,
        HolidayListName,
        ExpensePolicyName,
        NoticePeriod,
        CostCenter,
      } = data;

      if (!employee_id) {
        return {
          success: false,
          statusCode: 400,
          message: 'Missing required field: employee_id.',
        };
      }

      if (standalone) {
        connection = await pool.getConnection();
        await connection.beginTransaction();
      }

      const queryConnection = standalone ? connection : pool;
      if (queryConnection) {
        const [result]: [ResultSetHeader, any] = await queryConnection.query(
          `INSERT INTO employment_details 
    (employee_id, attendance_number, location, location_country, legal_entity, business_unit, department, sub_department, job_title, secondary_job_title, reporting_to, reporting_manager_employee_number, dotted_line_manager, date_joined, leave_plan, band, pay_grade, time_type, worker_type, shift_policy_name, weekly_off_policy_name, attendance_time_tracking_policy, attendance_capture_scheme, holiday_list_name, expense_policy_name, notice_period, cost_center)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            employee_id,
            AttendanceNumber || null,
            Location || null,
            LocationCountry || null,
            LegalEntity || null,
            BusinessUnit || null,
            Department || null,
            SubDepartment || null,
            JobTitle || null,
            SecondaryJobTitle || null,
            ReportingTo || null,
            ReportingManagerEmployeeNumber || null,
            DottedLineManager || null,
            DateJoined || null,
            LeavePlan || null,
            Band || null,
            PayGrade || null,
            TimeType || null,
            WorkerType || null,
            ShiftPolicyName || null,
            WeeklyOffPolicyName || null,
            AttendanceTimeTrackingPolicy || null,
            AttendanceCaptureScheme || null,
            HolidayListName || null,
            ExpensePolicyName || null,
            NoticePeriod || null,
            CostCenter || null,
          ]
        );

        if (standalone && connection) {
          await connection.commit();
        }

        return {
          success: true,
          statusCode: 201,
          message: 'Employment details inserted successfully.',
          data: { employment_id: result.insertId },
        };
      }

      return {
        success: false,
        statusCode: 500,
        message: 'Database connection unavailable.',
        error: 'Connection Error',
      };
    } catch (error: any) {
      console.error('Error inserting employment details:', error);

      if (standalone && connection) {
        await connection.rollback();
      }

      return {
        success: false,
        statusCode: 500,
        message: 'Internal server error.',
        error: error.message,
      };
    } finally {
      if (standalone && connection) {
        connection.release();
      }
    }
  }

  async addExitdetails(
    req: Request,
    res: Response,
    standalone?: boolean
  ): Promise<promised> {
    let connection: PoolConnection | null = null;

    try {
      const {
        employee_id,
        EmploymentStatus,
        ExitDate,
        Comments,
        ExitStatus,
        TerminationType,
        TerminationReason,
        ResignationNote,
      } = req.body;

      if (!employee_id) {
        return {
          success: false,
          statusCode: 400,
          message: 'Missing required field: employee_id.',
        };
      }

      if (standalone) {
        connection = await pool.getConnection();
        await connection.beginTransaction();
      }

      const queryConnection = standalone ? connection : pool;
      if (queryConnection) {
        const [result]: [ResultSetHeader, any] = await queryConnection.query(
          `INSERT INTO exit_details 
    (employee_id, employment_status, exit_date, comments, exit_status, termination_type, termination_reason, resignation_note) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            employee_id,
            EmploymentStatus || null,
            ExitDate || null,
            Comments || null,
            ExitStatus || null,
            TerminationType || null,
            TerminationReason || null,
            ResignationNote || null,
          ]
        );

        if (standalone && connection) {
          await connection.commit();
        }

        return {
          success: true,
          message: 'Exit details added successfully',
          data: { exit_id: result.insertId },
          statusCode: 200,
        };
      }

      return {
        success: false,
        statusCode: 500,
        message: 'Database connection unavailable.',
        error: 'Connection Error',
      };
    } catch (error: any) {
      console.error('Error inserting exit details:', error);

      if (standalone && connection) {
        await connection.rollback();
      }

      return {
        success: false,
        statusCode: 500,
        message: 'Internal server error.',
        error: error.message,
      };
    } finally {
      if (standalone && connection) {
        connection.release();
      }
    }
  }

  async addFamilyInfo(
    req: Request,
    res: Response,
    standalone?: boolean
  ): Promise<promised> {
    let connection: PoolConnection | null = null;

    try {
      const { employee_id, FatherName, MotherName, SpouseName, ChildrenNames } =
        req.body;

      if (!employee_id) {
        return {
          success: false,
          statusCode: 400,
          message: 'Missing required field: employee_id.',
          error: 'Validation Error',
        };
      }

      if (standalone) {
        connection = await pool.getConnection();
        await connection.beginTransaction();
      }

      const queryConnection = standalone ? connection : pool;
      if (queryConnection) {
        const [result]: [ResultSetHeader, any] = await queryConnection.query(
          `INSERT INTO family_info 
    (employee_id, father_name, mother_name, spouse_name, children_names)
    VALUES (?, ?, ?, ?, ?)`,
          [
            employee_id,
            FatherName || null,
            MotherName || null,
            SpouseName || null,
            ChildrenNames || null,
          ]
        );

        if (standalone && connection) {
          await connection.commit();
        }

        return {
          success: true,
          statusCode: 201,
          message: 'Employee Family Details inserted successfully.',
          data: { employee_id, family_id: result.insertId },
        };
      }

      return {
        success: false,
        statusCode: 500,
        message: 'Database connection unavailable.',
        error: 'Connection Error',
      };
    } catch (error: any) {
      console.error('Error inserting family info:', error);

      if (standalone && connection) {
        await connection.rollback();
      }

      return {
        success: false,
        statusCode: 500,
        message: 'Internal server error.',
        error: error.message,
      };
    } finally {
      if (standalone && connection) {
        connection.release();
      }
    }
  }

  async addStatutoryInfo(
    req: Request,
    res: Response,
    standalone?: boolean
  ): Promise<promised> {
    let connection: PoolConnection | null = null;

    try {
      const { employee_id, PANNumber, AadhaarNumber, PFNumber, UANNumber } =
        req.body;

      if (!employee_id) {
        return {
          success: false,
          statusCode: 400,
          message: 'Missing required field: employee_id.',
          error: 'Validation Error',
        };
      }

      if (standalone) {
        connection = await pool.getConnection();
        await connection.beginTransaction();
      }

      const queryConnection = standalone ? connection : pool;
      if (queryConnection) {
        const [result]: [ResultSetHeader, any] = await queryConnection.query(
          `INSERT INTO statutory_info 
    (employee_id, pan_number, aadhaar_number, pf_number, uan_number)
    VALUES (?, ?, ?, ?, ?)`,
          [
            employee_id,
            PANNumber || null,
            AadhaarNumber || null,
            PFNumber || null,
            UANNumber || null,
          ]
        );

        if (standalone && connection) {
          await connection.commit();
        }

        return {
          success: true,
          statusCode: 201,
          message: 'Employee Statutory info inserted successfully.',
          data: { employee_id, statutory_id: result.insertId },
        };
      }

      return {
        success: false,
        statusCode: 500,
        message: 'Database connection unavailable.',
        error: 'Connection Error',
      };
    } catch (error: any) {
      console.error('Error inserting statutory info:', error);

      if (standalone && connection) {
        await connection.rollback();
      }

      return {
        success: false,
        statusCode: 500,
        message: 'Internal server error.',
        error: error.message,
      };
    } finally {
      if (standalone && connection) {
        connection.release();
      }
    }
  }

  async viewEmployees(req: Request, res: Response): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      conn = await pool.getConnection();
      const employee_id = req.body.employee_id || req.query.employee_id;

      const baseQuery = `
  SELECT 
    e.*,
    ca.address_line1 AS current_line1, ca.address_line2 AS current_line2, ca.city AS current_city,
    ca.state AS current_state, ca.zip AS current_zip, ca.country AS current_country,
    pa.address_line1 AS permanent_line1, pa.address_line2 AS permanent_line2, pa.city AS permanent_city,
    pa.state AS permanent_state, pa.zip AS permanent_zip, pa.country AS permanent_country,
    ed.*,
    fi.father_name, fi.mother_name, fi.spouse_name, fi.children_names,
    si.pan_number, si.aadhaar_number, si.pf_number, si.uan_number,
    ex.employment_status, ex.exit_date, ex.comments, ex.exit_status,
    ex.termination_type, ex.termination_reason, ex.resignation_note
  FROM employees e
  LEFT JOIN addresses ca ON e.employee_id = ca.employee_id AND ca.address_type = 'Current'
  LEFT JOIN addresses pa ON e.employee_id = pa.employee_id AND pa.address_type = 'Permanent'
  LEFT JOIN employment_details ed ON e.employee_id = ed.employee_id
  LEFT JOIN family_info fi ON e.employee_id = fi.employee_id
  LEFT JOIN statutory_info si ON e.employee_id = si.employee_id
  LEFT JOIN exit_details ex ON e.employee_id = ex.employee_id
  ${employee_id ? 'WHERE e.employee_id = ?' : ''}
`;

      const [rows]: any = employee_id
        ? await conn.query(baseQuery, [employee_id])
        : await conn.query(baseQuery);

      return {
        success: true,
        message: rows.length > 0 ? 'Employee(s) found' : 'No employees found',
        data: rows,
        statusCode: 200,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch employees',
        data: { error: error.message },
        statusCode: 500,
      };
    } finally {
      if (conn) conn.release();
    }
  }

  async editEmployees(req: Request, res: Response): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      const { employee_id, ...updates } = req.body;
      if (!employee_id) {
        return {
          success: false,
          message: 'employee_id is required',
          statusCode: 400,
        };
      }

      conn = await pool.getConnection();
      await conn.beginTransaction();

      const allowed = [
        'first_name',
        'middle_name',
        'last_name',
        'full_name',
        'work_email',
        'gender',
        'marital_status',
        'blood_group',
        'physically_handicapped',
        'nationality',
      ];
      const fields = Object.keys(updates).filter((k) => allowed.includes(k));
      if (fields.length === 0) {
        return {
          success: false,
          message: 'No valid fields to update',
          statusCode: 400,
        };
      }

      const setClause = fields.map((f) => `${f} = ?`).join(', ');
      const values = fields.map((f) => updates[f] ?? null);
      values.push(employee_id);

      const [result]: [ResultSetHeader, any] = await conn.query(
        `UPDATE employees SET ${setClause} WHERE employee_id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        throw new Error('Employee not found');
      }

      await conn.commit();
      return { success: true, message: 'Employee updated', statusCode: 200 };
    } catch (error: any) {
      if (conn) await conn.rollback();
      return { success: false, message: error.message, statusCode: 500 };
    } finally {
      if (conn) conn.release();
    }
  }

  async deleteEmployees(req: Request, res: Response): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      const { employee_id } = req.body;
      if (!employee_id) {
        return {
          success: false,
          message: 'employee_id is required',
          statusCode: 400,
        };
      }

      conn = await pool.getConnection();
      await conn.beginTransaction();

      await conn.query('DELETE FROM addresses WHERE employee_id = ?', [
        employee_id,
      ]);
      await conn.query('DELETE FROM employment_details WHERE employee_id = ?', [
        employee_id,
      ]);
      await conn.query('DELETE FROM family_info WHERE employee_id = ?', [
        employee_id,
      ]);
      await conn.query('DELETE FROM statutory_info WHERE employee_id = ?', [
        employee_id,
      ]);
      await conn.query('DELETE FROM exit_details WHERE employee_id = ?', [
        employee_id,
      ]);
      const [result]: [ResultSetHeader, any] = await conn.query(
        'DELETE FROM employees WHERE employee_id = ?',
        [employee_id]
      );

      if (result.affectedRows === 0) {
        throw new Error('Employee not found');
      }

      await conn.commit();
      return {
        success: true,
        message: 'Employee and all data deleted',
        statusCode: 200,
      };
    } catch (error: any) {
      if (conn) await conn.rollback();
      return { success: false, message: error.message, statusCode: 500 };
    } finally {
      if (conn) conn.release();
    }
  }

  async viewAddress(req: Request, res: Response): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      const { employee_id, address_type } = req.query;
      if (!employee_id) {
        return {
          success: false,
          message: 'employee_id is required',
          statusCode: 400,
        };
      }

      conn = await pool.getConnection();
      let query = 'SELECT * FROM addresses WHERE employee_id = ?';
      const params: any[] = [employee_id];

      if (address_type) {
        query += ' AND address_type = ?';
        params.push(address_type);
      }

      const [rows]: any = await conn.query(query, params);
      return {
        success: true,
        message: rows.length > 0 ? 'Address found' : 'No address found',
        data: rows,
        statusCode: 200,
      };
    } catch (error: any) {
      return { success: false, message: error.message, statusCode: 500 };
    } finally {
      if (conn) conn.release();
    }
  }

  async editAddress(req: Request, res: Response): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      const { employee_id, address_type, ...updates } = req.body;
      if (!employee_id || !address_type) {
        return {
          success: false,
          message: 'employee_id and address_type required',
          statusCode: 400,
        };
      }

      conn = await pool.getConnection();
      await conn.beginTransaction();

      const fields = [
        'address_line1',
        'address_line2',
        'city',
        'state',
        'zip',
        'country',
      ];
      const setClause = fields.map((f) => `${f} = ?`).join(', ');
      const values = fields.map((f) =>
        updates[f] != null ? this.truncateZip(updates[f]) : null
      );
      values.push(employee_id, address_type);

      const [result]: [ResultSetHeader, any] = await conn.query(
        `UPDATE addresses SET ${setClause} WHERE employee_id = ? AND address_type = ?`,
        values
      );

      if (result.affectedRows === 0) {
        await conn.query(
          `INSERT INTO addresses (employee_id, address_type, address_line1, address_line2, city, state, zip, country)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [employee_id, address_type, ...values.slice(0, 6)]
        );
      }

      await conn.commit();
      return { success: true, message: 'Address updated', statusCode: 200 };
    } catch (error: any) {
      if (conn) await conn.rollback();
      return { success: false, message: error.message, statusCode: 500 };
    } finally {
      if (conn) conn.release();
    }
  }

  async deleteAddress(req: Request, res: Response): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      const { employee_id, address_type } = req.body;
      if (!employee_id || !address_type) {
        return {
          success: false,
          message: 'employee_id and address_type required',
          statusCode: 400,
        };
      }

      conn = await pool.getConnection();
      const [result]: [ResultSetHeader, any] = await conn.query(
        'DELETE FROM addresses WHERE employee_id = ? AND address_type = ?',
        [employee_id, address_type]
      );

      return {
        success: true,
        message:
          result.affectedRows > 0 ? 'Address deleted' : 'Address not found',
        statusCode: 200,
      };
    } catch (error: any) {
      return { success: false, message: error.message, statusCode: 500 };
    } finally {
      if (conn) conn.release();
    }
  }

  async editEmployement_details(
    req: Request,
    res: Response
  ): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      const { employee_id, ...updates } = req.body;
      if (!employee_id)
        return {
          success: false,
          message: 'employee_id required',
          statusCode: 400,
        };

      conn = await pool.getConnection();
      await conn.beginTransaction();

      const allowed = Object.keys(updates).filter((k) =>
        [
          'attendance_number',
          'location',
          'location_country',
          'legal_entity',
          'business_unit',
          'department',
          'sub_department',
          'job_title',
          'secondary_job_title',
          'reporting_to',
          'reporting_manager_employee_number',
          'dotted_line_manager',
          'date_joined',
          'leave_plan',
          'band',
          'pay_grade',
          'time_type',
          'worker_type',
          'shift_policy_name',
          'weekly_off_policy_name',
          'attendance_time_tracking_policy',
          'attendance_capture_scheme',
          'holiday_list_name',
          'expense_policy_name',
          'notice_period',
          'cost_center',
        ].includes(k)
      );

      if (allowed.length === 0) {
        return { success: false, message: 'No valid fields', statusCode: 400 };
      }

      const reportingMgrNum = updates.reporting_manager_employee_number
        ? await this.getEmployeeIdByNumber(
            conn,
            this.resolveReportingManager(
              updates.reporting_manager_employee_number
            )!
          )
        : null;

      const setClause = allowed.map((f) => `${f} = ?`).join(', ');
      const values = allowed.map((f) => {
        if (f === 'date_joined') return this.formatDate(updates[f]);
        if (f === 'notice_period') return this.parseNoticePeriod(updates[f]);
        if (f === 'reporting_manager_employee_number')
          return reportingMgrNum ? updates[f] : null;
        return updates[f] ?? null;
      });
      values.push(employee_id);

      const [result]: [ResultSetHeader, any] = await conn.query(
        `UPDATE employment_details SET ${setClause} WHERE employee_id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        throw new Error('Employment details not found');
      }

      await conn.commit();
      return { success: true, message: 'Updated', statusCode: 200 };
    } catch (error: any) {
      if (conn) await conn.rollback();
      return { success: false, message: error.message, statusCode: 500 };
    } finally {
      if (conn) conn.release();
    }
  }

  async deleteEmployement_details(
    req: Request,
    res: Response
  ): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      const { employee_id } = req.body;
      if (!employee_id)
        return {
          success: false,
          message: 'employee_id required',
          statusCode: 400,
        };

      conn = await pool.getConnection();
      const [result]: [ResultSetHeader, any] = await conn.query(
        'DELETE FROM employment_details WHERE employee_id = ?',
        [employee_id]
      );

      return {
        success: true,
        message: result.affectedRows > 0 ? 'Deleted' : 'Not found',
        statusCode: 200,
      };
    } catch (error: any) {
      return { success: false, message: error.message, statusCode: 500 };
    } finally {
      if (conn) conn.release();
    }
  }

  async viewExitdetails(req: Request, res: Response): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      const { employee_id } = req.query;
      if (!employee_id)
        return {
          success: false,
          message: 'employee_id required',
          statusCode: 400,
        };

      conn = await pool.getConnection();
      const [rows]: any = await conn.query(
        'SELECT * FROM exit_details WHERE employee_id = ?',
        [employee_id]
      );

      return {
        success: true,
        message: rows.length > 0 ? 'Found' : 'Not found',
        data: rows[0] || null,
        statusCode: 200,
      };
    } catch (error: any) {
      return { success: false, message: error.message, statusCode: 500 };
    } finally {
      if (conn) conn.release();
    }
  }

  async editExitdetails(req: Request, res: Response): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      const { employee_id, ...updates } = req.body;
      if (!employee_id)
        return {
          success: false,
          message: 'employee_id required',
          statusCode: 400,
        };

      conn = await pool.getConnection();
      await conn.beginTransaction();

      const fields = [
        'employment_status',
        'exit_date',
        'comments',
        'exit_status',
        'termination_type',
        'termination_reason',
        'resignation_note',
      ];
      const setClause = fields.map((f) => `${f} = ?`).join(', ');
      const values = fields.map((f) =>
        f === 'exit_date' ? this.formatDate(updates[f]) : updates[f] ?? null
      );
      values.push(employee_id);

      const [result]: [ResultSetHeader, any] = await conn.query(
        `UPDATE exit_details SET ${setClause} WHERE employee_id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        await conn.query(
          `INSERT INTO exit_details (employee_id, ${fields.join(', ')})
      VALUES (?, ${fields.map(() => '?').join(', ')})`,
          [employee_id, ...values.slice(0, -1)]
        );
      }

      await conn.commit();
      return { success: true, message: 'Updated', statusCode: 200 };
    } catch (error: any) {
      if (conn) await conn.rollback();
      return { success: false, message: error.message, statusCode: 500 };
    } finally {
      if (conn) conn.release();
    }
  }
  async deleteExitdetails(req: Request, res: Response): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      const { employee_id } = req.body;
      if (!employee_id)
        return {
          success: false,
          message: 'employee_id required',
          statusCode: 400,
        };

      conn = await pool.getConnection();
      const [result]: [ResultSetHeader, any] = await conn.query(
        'DELETE FROM exit_details WHERE employee_id = ?',
        [employee_id]
      );

      return {
        success: true,
        message: result.affectedRows > 0 ? 'Deleted' : 'Not found',
        statusCode: 200,
      };
    } catch (error: any) {
      return { success: false, message: error.message, statusCode: 500 };
    } finally {
      if (conn) conn.release();
    }
  }

  async viewFamilyInfo(req: Request, res: Response): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      const { employee_id } = req.query;
      if (!employee_id)
        return {
          success: false,
          message: 'employee_id required',
          statusCode: 400,
        };

      conn = await pool.getConnection();
      const [rows]: any = await conn.query(
        'SELECT * FROM family_info WHERE employee_id = ?',
        [employee_id]
      );

      return {
        success: true,
        message: rows.length > 0 ? 'Found' : 'Not found',
        data: rows[0] || null,
        statusCode: 200,
      };
    } catch (error: any) {
      return { success: false, message: error.message, statusCode: 500 };
    } finally {
      if (conn) conn.release();
    }
  }
  async editFamilyInfo(req: Request, res: Response): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      const {
        employee_id,
        father_name,
        mother_name,
        spouse_name,
        children_names,
      } = req.body;
      if (!employee_id)
        return {
          success: false,
          message: 'employee_id required',
          statusCode: 400,
        };

      conn = await pool.getConnection();
      await conn.beginTransaction();

      const [result]: [ResultSetHeader, any] = await conn.query(
        `UPDATE family_info SET father_name = ?, mother_name = ?, spouse_name = ?, children_names = ?
    WHERE employee_id = ?`,
        [
          father_name ?? null,
          mother_name ?? null,
          spouse_name ?? null,
          children_names ?? null,
          employee_id,
        ]
      );

      if (result.affectedRows === 0) {
        await conn.query(
          `INSERT INTO family_info (employee_id, father_name, mother_name, spouse_name, children_names)
      VALUES (?, ?, ?, ?, ?)`,
          [
            employee_id,
            father_name ?? null,
            mother_name ?? null,
            spouse_name ?? null,
            children_names ?? null,
          ]
        );
      }

      await conn.commit();
      return { success: true, message: 'Updated', statusCode: 200 };
    } catch (error: any) {
      if (conn) await conn.rollback();
      return { success: false, message: error.message, statusCode: 500 };
    } finally {
      if (conn) conn.release();
    }
  }

  async deleteFamilyInfo(req: Request, res: Response): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      const { employee_id } = req.body;
      if (!employee_id)
        return {
          success: false,
          message: 'employee_id required',
          statusCode: 400,
        };

      conn = await pool.getConnection();
      const [result]: [ResultSetHeader, any] = await conn.query(
        'DELETE FROM family_info WHERE employee_id = ?',
        [employee_id]
      );

      return {
        success: true,
        message: result.affectedRows > 0 ? 'Deleted' : 'Not found',
        statusCode: 200,
      };
    } catch (error: any) {
      return { success: false, message: error.message, statusCode: 500 };
    } finally {
      if (conn) conn.release();
    }
  }

  async viewStatutoryInfo(req: Request, res: Response): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      const { employee_id } = req.query;
      if (!employee_id)
        return {
          success: false,
          message: 'employee_id required',
          statusCode: 400,
        };

      conn = await pool.getConnection();
      const [rows]: any = await conn.query(
        'SELECT * FROM statutory_info WHERE employee_id = ?',
        [employee_id]
      );

      return {
        success: true,
        message: rows.length > 0 ? 'Found' : 'Not found',
        data: rows[0] || null,
        statusCode: 200,
      };
    } catch (error: any) {
      return { success: false, message: error.message, statusCode: 500 };
    } finally {
      if (conn) conn.release();
    }
  }
  async editStatutoryInfo(req: Request, res: Response): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      const { employee_id, pan_number, aadhaar_number, pf_number, uan_number } =
        req.body;
      if (!employee_id)
        return {
          success: false,
          message: 'employee_id required',
          statusCode: 400,
        };

      conn = await pool.getConnection();
      await conn.beginTransaction();

      const [result]: [ResultSetHeader, any] = await conn.query(
        `UPDATE statutory_info SET pan_number = ?, aadhaar_number = ?, pf_number = ?, uan_number = ?
    WHERE employee_id = ?`,
        [
          pan_number ?? null,
          aadhaar_number ?? null,
          pf_number ?? null,
          uan_number ?? null,
          employee_id,
        ]
      );

      if (result.affectedRows === 0) {
        await conn.query(
          `INSERT INTO statutory_info (employee_id, pan_number, aadhaar_number, pf_number, uan_number)
      VALUES (?, ?, ?, ?, ?)`,
          [
            employee_id,
            pan_number ?? null,
            aadhaar_number ?? null,
            pf_number ?? null,
            uan_number ?? null,
          ]
        );
      }

      await conn.commit();
      return { success: true, message: 'Updated', statusCode: 200 };
    } catch (error: any) {
      if (conn) await conn.rollback();
      return { success: false, message: error.message, statusCode: 500 };
    } finally {
      if (conn) conn.release();
    }
  }
  async deleteStatutoryInfo(req: Request, res: Response): Promise<ApiResponse> {
    let conn: PoolConnection | null = null;
    try {
      const { employee_id } = req.body;
      if (!employee_id)
        return {
          success: false,
          message: 'employee_id required',
          statusCode: 400,
        };

      conn = await pool.getConnection();
      const [result]: [ResultSetHeader, any] = await conn.query(
        'DELETE FROM statutory_info WHERE employee_id = ?',
        [employee_id]
      );

      return {
        success: true,
        message: result.affectedRows > 0 ? 'Deleted' : 'Not found',
        statusCode: 200,
      };
    } catch (error: any) {
      return { success: false, message: error.message, statusCode: 500 };
    } finally {
      if (conn) conn.release();
    }
  }
  formatDate(dateInput: any): string | null {
    if (!dateInput || dateInput === 'null' || dateInput === '') return null;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;
    return String(date.toISOString().split('T')[0]);
  }

  parseIntSafe(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = parseInt(String(value), 10);
    return isNaN(num) ? null : num;
  }

  parseNoticePeriod(text: any): number | null {
    if (!text) return null;
    const match: any = String(text).match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  resolveReportingManager(value: any): string | null {
    if (!value || value === '' || value === null || value === undefined)
      return null;
    const str = String(value).trim().toLowerCase();
    const invalid = [
      'not available',
      'n/a',
      'na',
      'none',
      'not applicable',
      '-',
      'null',
      'unknown',
      'no manager',
      'self',
      'ceo',
    ];
    return invalid.includes(str) ? null : String(value).trim();
  }

  truncateZip(zip: any): string | null {
    if (!zip) return null;
    return String(zip).substring(0, 20);
  }

  hasData(obj: any, keys: string[]): boolean {
    return keys.some((key) => obj[key] != null && obj[key] !== '');
  }

  async getEmployeeIdByNumber(
    conn: PoolConnection,
    employeeNumber: string
  ): Promise<number | null> {
    const [rows]: any = await conn.query(
      'SELECT employee_id FROM employees WHERE employee_number = ? LIMIT 1',
      [employeeNumber]
    );
    return rows.length > 0 ? rows[0].employee_id : null;
  }

  public static async upsertProfilePic(
    employee_id: number,
    image: string
  ): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      // Step 1: Check if the employee already has a profile picture
      const [rows]: any = await connection.query(
        'SELECT id FROM employee_profile_pic WHERE employee_id = ?',
        [employee_id]
      );

      if (rows.length > 0) {
        // Step 2: Update existing record
        const [updateResult]: any = await connection.query(
          'UPDATE employee_profile_pic SET image = ? WHERE employee_id = ?',
          [image, employee_id]
        );
        return updateResult.affectedRows > 0;
      } else {
        // Step 3: Insert new record
        const [insertResult]: any = await connection.query(
          'INSERT INTO employee_profile_pic (employee_id, image) VALUES (?, ?)',
          [employee_id, image]
        );
        return insertResult.affectedRows > 0;
      }
    } catch (error) {
      console.error('Error in upsertProfilePic:', error);
      return false;
    } finally {
      connection.release();
    }
  }
}

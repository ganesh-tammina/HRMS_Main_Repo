import { pool } from '../config/database';
import { Request, Response } from 'express';
import { EmployeesInterface, promised } from '../interface/employee-interface';
import { PoolConnection, ResultSetHeader } from 'mysql2/promise';

export default class Employeeservices implements EmployeesInterface {
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

  private hasAddressData(
    data: any,
    addressType: 'Current' | 'Permanent'
  ): boolean {
    const prefix = addressType === 'Current' ? 'Current' : 'Permanent';
    return !!(
      data[`${prefix}AddressLine1`] ||
      data[`${prefix}AddressLine2`] ||
      data[`${prefix}AddressCity`] ||
      data[`${prefix}AddressState`] ||
      data[`${prefix}AddressZip`] ||
      data[`${prefix}AddressCountry`]
    );
  }

  private hasEmploymentData(data: any): boolean {
    return !!(
      data.AttendanceNumber ||
      data.Location ||
      data.Department ||
      data.JobTitle ||
      data.DateJoined
    );
  }

  private hasFamilyData(data: any): boolean {
    return !!(
      data.FatherName ||
      data.MotherName ||
      data.SpouseName ||
      data.ChildrenNames
    );
  }

  private hasStatutoryData(data: any): boolean {
    return !!(
      data.PANNumber ||
      data.AadhaarNumber ||
      data.PFNumber ||
      data.UANNumber
    );
  }

  private hasExitData(data: any): boolean {
    return !!(
      data.ExitDate ||
      data.ExitStatus ||
      data.TerminationType ||
      data.TerminationReason ||
      data.ResignationNote ||
      (data.EmploymentStatus &&
        data.EmploymentStatus.toLowerCase() !== 'working' &&
        data.EmploymentStatus.toLowerCase() !== 'active')
    );
  }

  public static async bulkInsertEmployees(
    req: Request,
    res: Response
  ): Promise<any> {
    const employees = req.body;
    const employeeservice = new Employeeservices();

    if (!Array.isArray(employees) || employees.length === 0) {
      return {
        success: false,
        message: 'Request body must be a non-empty array.',
        statusCode: 400,
      };
    }

    const successfulInserts: any[] = [];
    const failedInserts: any[] = [];

    for (let i = 0; i < employees.length; i++) {
      console.log('bulk-', i);
      const emp = employees[i];
      const employeeReport: any = {
        index: i,
        employeeNumber: emp.EmployeeNumber || 'N/A',
        workEmail: emp.WorkEmail || 'N/A',
        status: 'processing',
        inserted: {},
        skipped: {},
        errors: [],
      };

      let connection: PoolConnection | null = null;

      try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        if (!emp.EmployeeNumber || !emp.WorkEmail) {
          throw new Error(
            'Missing required fields: EmployeeNumber and WorkEmail'
          );
        }

        const [empResult]: [ResultSetHeader, any] = await connection.query(
          `INSERT INTO employees 
          (employee_number, first_name, middle_name, last_name, full_name, work_email, gender, marital_status, blood_group, physically_handicapped, nationality, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            emp.EmployeeNumber,
            emp.FirstName || null,
            emp.MiddleName || null,
            emp.LastName || null,
            emp.FullName || null,
            emp.WorkEmail,
            emp.Gender || null,
            emp.MaritalStatus || null,
            emp.BloodGroup || null,
            emp.PhysicallyHandicapped || null,
            emp.Nationality || null,
            new Date(),
            new Date(),
          ]
        );

        const employee_id = empResult.insertId;
        employeeReport.employee_id = employee_id;
        employeeReport.inserted.employee = true;

        if (employeeservice.hasAddressData(emp, 'Current')) {
          try {
            await connection.query(
              `INSERT INTO addresses 
              (employee_id, address_type, address_line1, address_line2, city, state, zip, country)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                employee_id,
                'Current',
                emp.CurrentAddressLine1 || null,
                emp.CurrentAddressLine2 || null,
                emp.CurrentAddressCity || null,
                emp.CurrentAddressState || null,
                emp.CurrentAddressZip || null,
                emp.CurrentAddressCountry || null,
              ]
            );
            employeeReport.inserted.currentAddress = true;
          } catch (addrError: any) {
            employeeReport.errors.push(`Current address: ${addrError.message}`);
          }
        } else {
          employeeReport.skipped.currentAddress = 'No data provided';
        }

        if (employeeservice.hasAddressData(emp, 'Permanent')) {
          try {
            await connection.query(
              `INSERT INTO addresses 
              (employee_id, address_type, address_line1, address_line2, city, state, zip, country)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                employee_id,
                'Permanent',
                emp.PermanentAddressLine1 || null,
                emp.PermanentAddressLine2 || null,
                emp.PermanentAddressCity || null,
                emp.PermanentAddressState || null,
                emp.PermanentAddressZip || null,
                emp.PermanentAddressCountry || null,
              ]
            );
            employeeReport.inserted.permanentAddress = true;
          } catch (addrError: any) {
            employeeReport.errors.push(
              `Permanent address: ${addrError.message}`
            );
          }
        } else {
          employeeReport.skipped.permanentAddress = 'No data provided';
        }

        if (employeeservice.hasEmploymentData(emp)) {
          try {
            await connection.query(
              `INSERT INTO employment_details 
              (employee_id, attendance_number, location, location_country, legal_entity, business_unit, department, sub_department, job_title, secondary_job_title, reporting_to, reporting_manager_employee_number, dotted_line_manager, date_joined, leave_plan, band, pay_grade, time_type, worker_type, shift_policy_name, weekly_off_policy_name, attendance_time_tracking_policy, attendance_capture_scheme, holiday_list_name, expense_policy_name, notice_period, cost_center)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                employee_id,
                emp.AttendanceNumber || null,
                emp.Location || null,
                emp.LocationCountry || null,
                emp.LegalEntity || null,
                emp.BusinessUnit || null,
                emp.Department || null,
                emp.SubDepartment || null,
                emp.JobTitle || null,
                emp.SecondaryJobTitle || null,
                emp.ReportingTo || null,
                emp.ReportingManagerEmployeeNumber || null,
                emp.DottedLineManager || null,
                emp.DateJoined || null,
                emp.LeavePlan || null,
                emp.Band || null,
                emp.PayGrade || null,
                emp.TimeType || null,
                emp.WorkerType || null,
                emp.ShiftPolicyName || null,
                emp.WeeklyOffPolicyName || null,
                emp.AttendanceTimeTrackingPolicy || null,
                emp.AttendanceCaptureScheme || null,
                emp.HolidayListName || null,
                emp.ExpensePolicyName || null,
                emp.NoticePeriod || null,
                emp.CostCenter || null,
              ]
            );
            employeeReport.inserted.employmentDetails = true;
          } catch (empError: any) {
            employeeReport.errors.push(
              `Employment details: ${empError.message}`
            );
          }
        } else {
          employeeReport.skipped.employmentDetails = 'No data provided';
        }

        if (employeeservice.hasFamilyData(emp)) {
          try {
            await connection.query(
              `INSERT INTO family_info 
              (employee_id, father_name, mother_name, spouse_name, children_names)
              VALUES (?, ?, ?, ?, ?)`,
              [
                employee_id,
                emp.FatherName || null,
                emp.MotherName || null,
                emp.SpouseName || null,
                emp.ChildrenNames || null,
              ]
            );
            employeeReport.inserted.familyInfo = true;
          } catch (famError: any) {
            employeeReport.errors.push(`Family info: ${famError.message}`);
          }
        } else {
          employeeReport.skipped.familyInfo = 'No data provided';
        }

        if (employeeservice.hasStatutoryData(emp)) {
          try {
            await connection.query(
              `INSERT INTO statutory_info 
              (employee_id, pan_number, aadhaar_number, pf_number, uan_number)
              VALUES (?, ?, ?, ?, ?)`,
              [
                employee_id,
                emp.PANNumber || null,
                emp.AadhaarNumber || null,
                emp.PFNumber || null,
                emp.UANNumber || null,
              ]
            );
            employeeReport.inserted.statutoryInfo = true;
          } catch (statError: any) {
            employeeReport.errors.push(`Statutory info: ${statError.message}`);
          }
        } else {
          employeeReport.skipped.statutoryInfo = 'No data provided';
        }

        if (employeeservice.hasExitData(emp)) {
          try {
            await connection.query(
              `INSERT INTO exit_details 
              (employee_id, employment_status, exit_date, comments, exit_status, termination_type, termination_reason, resignation_note) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                employee_id,
                emp.EmploymentStatus || null,
                emp.ExitDate || null,
                emp.Comments || null,
                emp.ExitStatus || null,
                emp.TerminationType || null,
                emp.TerminationReason || null,
                emp.ResignationNote || null,
              ]
            );
            employeeReport.inserted.exitDetails = true;
          } catch (exitError: any) {
            employeeReport.errors.push(`Exit details: ${exitError.message}`);
          }
        } else {
          employeeReport.skipped.exitDetails = 'No exit data';
        }

        await connection.commit();
        employeeReport.status = 'success';
        successfulInserts.push(employeeReport);
      } catch (error: any) {
        if (connection) {
          await connection.rollback();
        }

        employeeReport.status = 'failed';
        employeeReport.errors.push(`Employee: ${error.message}`);
        failedInserts.push(employeeReport);
      } finally {
        if (connection) {
          connection.release();
        }
      }
    }

    const totalProcessed = employees.length;
    const totalSuccess = successfulInserts.length;
    const totalFailed = failedInserts.length;

    return {
      success: totalFailed === 0,
      message:
        totalFailed === 0
          ? `All ${totalSuccess} employee(s) inserted successfully. No discrepancies found.`
          : `Processed ${totalProcessed} employee(s): ${totalSuccess} succeeded, ${totalFailed} failed.`,
      data: {
        summary: {
          totalProcessed,
          totalSuccess,
          totalFailed,
          timestamp: new Date().toISOString(),
        },
        successfulInserts,
        ...(totalFailed > 0 && { failedInserts }),
      },
      statusCode: totalFailed === 0 ? 200 : 207,
    };
  }

  editEmployees(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }

  deleteEmployees(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }

  viewEmployees(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }

  editAddress(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }

  deleteAddress(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }

  viewAddress(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }

  editEmployement_details(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }

  deleteEmployement_details(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }

  public async viewEmployement_details(
    req: Request,
    res: Response
  ): Promise<promised> {
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

  viewExitdetails(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }

  deleteExitdetails(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }

  editExitdetails(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }

  viewFamilyInfo(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }

  deleteFamilyInfo(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }

  editFamilyInfo(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }

  viewStatutoryInfo(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }

  deleteStatutoryInfo(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }

  editStatutoryInfo(req: Request, res: Response): Promise<any> {
    throw new Error('Method not implemented.');
  }
}

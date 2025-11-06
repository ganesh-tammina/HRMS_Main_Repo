"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
class BulkEmployeeInsertService {
    static formatDate(dateInput) {
        if (!dateInput || dateInput === 'null' || dateInput === '')
            return null;
        const date = new Date(dateInput);
        if (isNaN(date.getTime()))
            return null;
        return String(date.toISOString().split('T')[0]);
    }
    static parseIntSafe(value) {
        if (value === null || value === undefined || value === '')
            return null;
        const num = parseInt(String(value), 10);
        return isNaN(num) ? null : num;
    }
    static parseNoticePeriod(text) {
        if (!text)
            return null;
        const match = String(text).match(/(\d+)/);
        return match ? parseInt(match[1], 10) : null;
    }
    static resolveReportingManager(value) {
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
    static truncateZip(zip) {
        if (!zip)
            return null;
        return String(zip).substring(0, 20);
    }
    static hasData(obj, keys) {
        return keys.some((key) => obj[key] != null && obj[key] !== '');
    }
    static async bulkInsertEmployees(req, res) {
        const employees = req.body;
        if (!Array.isArray(employees) || employees.length === 0) {
            return {
                success: false,
                message: 'Request body must be a non-empty array.',
                statusCode: 400,
            };
        }
        const successfulInserts = [];
        const failedInserts = [];
        let masterConn = null;
        try {
            masterConn = await database_1.pool.getConnection();
            const [existingRows] = await masterConn.query('SELECT employee_number, employee_id FROM employees');
            const employeeNumberToId = new Map();
            for (const row of existingRows) {
                employeeNumberToId.set(row.employee_number, row.employee_id);
            }
            const empMap = new Map();
            const sortedEmployees = [];
            employees.forEach((emp) => {
                empMap.set(emp.EmployeeNumber, emp);
            });
            const inserted = new Set();
            const queue = [...employees];
            while (queue.length > 0) {
                let insertedThisRound = 0;
                for (let i = queue.length - 1; i >= 0; i--) {
                    const emp = queue[i];
                    const mgrNum = this.resolveReportingManager(emp.ReportingManagerEmployeeNumber);
                    if (!mgrNum || (empMap.has(mgrNum) && inserted.has(mgrNum))) {
                        sortedEmployees.push(emp);
                        inserted.add(emp.EmployeeNumber);
                        queue.splice(i, 1);
                        insertedThisRound++;
                    }
                }
                if (insertedThisRound === 0)
                    break;
            }
            sortedEmployees.push(...queue);
            for (let i = 0; i < sortedEmployees.length; i++) {
                const emp = sortedEmployees[i];
                const report = {
                    index: i,
                    employeeNumber: emp.EmployeeNumber || 'N/A',
                    workEmail: emp.WorkEmail || 'N/A',
                    status: 'processing',
                    inserted: {},
                    skipped: {},
                    errors: [],
                };
                let localConn = null;
                try {
                    localConn = await database_1.pool.getConnection();
                    await localConn.beginTransaction();
                    if (!emp.EmployeeNumber || !emp.WorkEmail) {
                        throw new Error('EmployeeNumber and WorkEmail are required');
                    }
                    if (employeeNumberToId.has(emp.EmployeeNumber)) {
                        throw new Error(`Duplicate EmployeeNumber: ${emp.EmployeeNumber}`);
                    }
                    const [empResult] = await localConn.query(`INSERT INTO employees 
            (employee_number, first_name, middle_name, last_name, full_name, work_email, 
             gender, marital_status, blood_group, physically_handicapped, nationality)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                        emp.EmployeeNumber,
                        emp.FirstName ?? null,
                        emp.MiddleName ?? null,
                        emp.LastName ?? null,
                        emp.FullName ?? null,
                        emp.WorkEmail,
                        emp.Gender ?? null,
                        emp.MaritalStatus ?? null,
                        emp.BloodGroup ?? null,
                        emp.PhysicallyHandicapped ?? null,
                        emp.Nationality ?? null,
                    ]);
                    const employee_id = empResult.insertId;
                    employeeNumberToId.set(emp.EmployeeNumber, employee_id);
                    report.employee_id = employee_id;
                    report.inserted.employee = true;
                    const currentAddrKeys = [
                        'CurrentAddressLine1',
                        'CurrentAddressLine2',
                        'CurrentAddressCity',
                        'CurrentAddressState',
                        'CurrentAddressZip',
                        'CurrentAddressCountry',
                    ];
                    if (this.hasData(emp, currentAddrKeys)) {
                        await localConn.query(`INSERT INTO addresses 
              (employee_id, address_type, address_line1, address_line2, city, state, zip, country)
              VALUES (?, 'Current', ?, ?, ?, ?, ?, ?)`, [
                            employee_id,
                            emp.CurrentAddressLine1 ?? null,
                            emp.CurrentAddressLine2 ?? null,
                            emp.CurrentAddressCity ?? null,
                            emp.CurrentAddressState ?? null,
                            this.truncateZip(emp.CurrentAddressZip),
                            emp.CurrentAddressCountry ?? null,
                        ]);
                        report.inserted.currentAddress = true;
                    }
                    else {
                        report.skipped.currentAddress = 'No data';
                    }
                    const permAddrKeys = [
                        'PermanentAddressLine1',
                        'PermanentAddressLine2',
                        'PermanentAddressCity',
                        'PermanentAddressState',
                        'PermanentAddressZip',
                        'PermanentAddressCountry',
                    ];
                    if (this.hasData(emp, permAddrKeys)) {
                        await localConn.query(`INSERT INTO addresses 
              (employee_id, address_type, address_line1, address_line2, city, state, zip, country)
              VALUES (?, 'Permanent', ?, ?, ?, ?, ?, ?)`, [
                            employee_id,
                            emp.PermanentAddressLine1 ?? null,
                            emp.PermanentAddressLine2 ?? null,
                            emp.PermanentAddressCity ?? null,
                            emp.PermanentAddressState ?? null,
                            this.truncateZip(emp.PermanentAddressZip),
                            emp.PermanentAddressCountry ?? null,
                        ]);
                        report.inserted.permanentAddress = true;
                    }
                    else {
                        report.skipped.permanentAddress = 'No data';
                    }
                    const empDetailKeys = [
                        'AttendanceNumber',
                        'Location',
                        'LocationCountry',
                        'LegalEntity',
                        'BusinessUnit',
                        'Department',
                        'SubDepartment',
                        'JobTitle',
                        'SecondaryJobTitle',
                        'ReportingTo',
                        'ReportingManagerEmployeeNumber',
                        'DottedLineManager',
                        'DateJoined',
                        'LeavePlan',
                        'Band',
                        'PayGrade',
                        'TimeType',
                        'WorkerType',
                        'ShiftPolicyName',
                        'WeeklyOffPolicyName',
                        'AttendanceTimeTrackingPolicy',
                        'AttendanceCaptureScheme',
                        'HolidayListName',
                        'ExpensePolicyName',
                        'NoticePeriod',
                        'CostCenter',
                    ];
                    if (this.hasData(emp, empDetailKeys)) {
                        const noticePeriod = this.parseNoticePeriod(emp.NoticePeriod);
                        const dateJoined = this.formatDate(emp.DateJoined);
                        const rawMgrNum = this.resolveReportingManager(emp.ReportingManagerEmployeeNumber);
                        const reportingManagerEmpNo = rawMgrNum && employeeNumberToId.has(rawMgrNum) ? rawMgrNum : null;
                        await localConn.query(`INSERT INTO employment_details 
              (employee_id, attendance_number, location, location_country, legal_entity, 
               business_unit, department, sub_department, job_title, secondary_job_title, 
               reporting_to, reporting_manager_employee_number, dotted_line_manager, 
               date_joined, leave_plan, band, pay_grade, time_type, worker_type, 
               shift_policy_name, weekly_off_policy_name, attendance_time_tracking_policy, 
               attendance_capture_scheme, holiday_list_name, expense_policy_name, 
               notice_period, cost_center)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                            employee_id,
                            emp.AttendanceNumber ?? null,
                            emp.Location ?? null,
                            emp.LocationCountry ?? null,
                            emp.LegalEntity ?? null,
                            emp.BusinessUnit ?? null,
                            emp.Department ?? null,
                            emp.SubDepartment ?? null,
                            emp.JobTitle ?? null,
                            emp.SecondaryJobTitle ?? null,
                            emp.ReportingTo ?? null,
                            reportingManagerEmpNo,
                            emp.DottedLineManager ?? null,
                            dateJoined,
                            emp.LeavePlan ?? null,
                            emp.Band ?? null,
                            emp.PayGrade ?? null,
                            emp.TimeType ?? null,
                            emp.WorkerType ?? null,
                            emp.ShiftPolicyName ?? null,
                            emp.WeeklyOffPolicyName ?? null,
                            emp.AttendanceTimeTrackingPolicy ?? null,
                            emp.AttendanceCaptureScheme ?? null,
                            emp.HolidayListName ?? null,
                            emp.ExpensePolicyName ?? null,
                            noticePeriod,
                            emp.CostCenter ?? null,
                        ]);
                        report.inserted.employmentDetails = true;
                    }
                    else {
                        report.skipped.employmentDetails = 'No data';
                    }
                    const familyKeys = [
                        'FatherName',
                        'MotherName',
                        'SpouseName',
                        'ChildrenNames',
                    ];
                    if (this.hasData(emp, familyKeys)) {
                        await localConn.query(`INSERT INTO family_info (employee_id, father_name, mother_name, spouse_name, children_names)
               VALUES (?, ?, ?, ?, ?)`, [
                            employee_id,
                            emp.FatherName ?? null,
                            emp.MotherName ?? null,
                            emp.SpouseName ?? null,
                            emp.ChildrenNames ?? null,
                        ]);
                        report.inserted.familyInfo = true;
                    }
                    else {
                        report.skipped.familyInfo = 'No data';
                    }
                    const statutoryKeys = [
                        'PANNumber',
                        'AadhaarNumber',
                        'PFNumber',
                        'UANNumber',
                    ];
                    if (this.hasData(emp, statutoryKeys)) {
                        await localConn.query(`INSERT INTO statutory_info (employee_id, pan_number, aadhaar_number, pf_number, uan_number)
               VALUES (?, ?, ?, ?, ?)`, [
                            employee_id,
                            emp.PANNumber ?? null,
                            emp.AadhaarNumber ?? null,
                            emp.PFNumber ?? null,
                            emp.UANNumber ?? null,
                        ]);
                        report.inserted.statutoryInfo = true;
                    }
                    else {
                        report.skipped.statutoryInfo = 'No data';
                    }
                    const isActive = ['working', 'active'].includes(String(emp.EmploymentStatus || '').toLowerCase());
                    const exitKeys = [
                        'ExitDate',
                        'ExitStatus',
                        'TerminationType',
                        'TerminationReason',
                        'ResignationNote',
                    ];
                    if (!isActive || this.hasData(emp, exitKeys)) {
                        await localConn.query(`INSERT INTO exit_details 
              (employee_id, employment_status, exit_date, comments, exit_status, termination_type, termination_reason, resignation_note)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                            employee_id,
                            emp.EmploymentStatus ?? null,
                            this.formatDate(emp.ExitDate),
                            emp.Comments ?? null,
                            emp.ExitStatus ?? null,
                            emp.TerminationType ?? null,
                            emp.TerminationReason ?? null,
                            emp.ResignationNote ?? null,
                        ]);
                        report.inserted.exitDetails = true;
                    }
                    else {
                        report.skipped.exitDetails = 'Active employee';
                    }
                    await localConn.commit();
                    report.status = 'success';
                    successfulInserts.push(report);
                }
                catch (error) {
                    if (localConn)
                        await localConn.rollback();
                    report.status = 'failed';
                    report.errors.push(error.message);
                    failedInserts.push(report);
                }
                finally {
                    if (localConn)
                        localConn.release();
                }
            }
        }
        catch (error) {
            return {
                success: false,
                message: 'DB error',
                error: error.message,
                statusCode: 500,
            };
        }
        finally {
            if (masterConn)
                masterConn.release();
        }
        const totalProcessed = employees.length;
        const totalSuccess = successfulInserts.length;
        const totalFailed = failedInserts.length;
        return {
            success: totalFailed === 0,
            message: totalFailed === 0
                ? `All ${totalSuccess} inserted.`
                : `Processed ${totalProcessed}: ${totalSuccess} OK, ${totalFailed} failed.`,
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
}
exports.default = BulkEmployeeInsertService;
//# sourceMappingURL=bulk-employee-insert-service.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const joi_1 = __importDefault(require("joi"));
const mailer_service_1 = require("./mail-sender-service/mailer-service");
const Password_Encryption_Decryption_1 = require("../utils/Password-Encryption-Decryption");
const env_1 = require("../config/env");
class LoginService {
    static emailSchema = joi_1.default.object({
        email: joi_1.default.string().email().max(255).lowercase().required(),
    });
    static passwordChangeSchema = joi_1.default.object({
        email: joi_1.default.string().email().max(255).lowercase().required(),
        otp: joi_1.default.string()
            .pattern(/^[0-9]{6}$/)
            .required(),
        newPassword: joi_1.default.string()
            .min(8)
            .max(64)
            .pattern(/[A-Z]/, 'uppercase letter')
            .pattern(/[a-z]/, 'lowercase letter')
            .pattern(/[0-9]/, 'number')
            .pattern(/[@$!%*?&#]/, 'special character')
            .required(),
    });
    static loginSchema = joi_1.default.object({
        email: joi_1.default.string().email().max(255).lowercase().required(),
        password: joi_1.default.string().required(),
    });
    static async emailCheck(req, res) {
        try {
            const { error, value } = LoginService.emailSchema.validate(req.body, {
                abortEarly: false,
            });
            if (error) {
                res.status(422).json({
                    success: false,
                    message: error.details[0].message,
                });
                return;
            }
            const { email } = value;
            const [credentialRows] = await database_1.pool.query(`SELECT * FROM employee_credentials WHERE email = ?`, [email]);
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
            const [employeeRows] = await database_1.pool.query(`SELECT employee_id, work_email FROM employees WHERE work_email = ?`, [email]);
            if (employeeRows.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Email not found.',
                });
                return;
            }
            await database_1.pool.query(`UPDATE password_change_otp SET status = 'expired' WHERE LOWER(email) = LOWER(?) AND status = 'active'`, [email]);
            const { employee_id } = employeeRows[0];
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
                    message: 'Password is not generated, please enter OTP and generate password',
                    employee_id,
                });
            }
            else {
                res.status(otpResponse.status).json(otpResponse);
            }
        }
        catch (error) {
            console.error('Email check error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error.',
            });
        }
    }
    static async passwordGen(req, res) {
        const conn = await database_1.pool.getConnection();
        try {
            const { error, value } = LoginService.passwordChangeSchema.validate(req.body, {
                abortEarly: false,
            });
            if (error) {
                res
                    .status(422)
                    .json({ success: false, message: error.details[0].message });
                return;
            }
            const { email, otp, newPassword } = value;
            await conn.beginTransaction();
            const [rows] = await conn.query(`SELECT * FROM password_change_otp WHERE email = ? AND otp = ? AND status = 'active' ORDER BY createdAt DESC LIMIT 1 FOR UPDATE`, [email, otp]);
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
                await conn.query(`UPDATE password_change_otp SET status = 'expired' WHERE sl_no = ?`, [otpRecord.sl_no]);
                await conn.commit();
                res.status(410).json({
                    success: false,
                    message: 'OTP expired. Please request a new one.',
                });
                return;
            }
            const [employeeRows] = await conn.query(`SELECT employee_id FROM employees WHERE work_email = ?`, [email]);
            if (employeeRows.length === 0) {
                await conn.rollback();
                res
                    .status(400)
                    .json({ success: false, message: 'Employee not found.' });
                return;
            }
            const empId = employeeRows[0].employee_id;
            const hashedPassword = await Password_Encryption_Decryption_1.PasswordUtil.hashPassword(newPassword);
            const [existingCred] = await conn.query(`SELECT * FROM employee_credentials WHERE email = ?`, [email]);
            if (existingCred.length > 0) {
                await conn.rollback();
                res.status(409).json({
                    success: false,
                    message: 'Password already set. Please login instead.',
                });
                return;
            }
            await conn.query(`INSERT INTO employee_credentials (employee_id, email, password) VALUES (?, ?, ?)`, [empId, email, hashedPassword]);
            await conn.query(`UPDATE password_change_otp SET status = 'used' WHERE sl_no = ?`, [otpRecord.sl_no]);
            await conn.commit();
            res.json({
                success: true,
                message: 'Password updated successfully',
            });
        }
        catch (err) {
            console.error('Error in passwordGen:', err);
            await conn.rollback();
            res
                .status(500)
                .json({ success: false, message: 'Internal server error' });
        }
        finally {
            conn.release();
        }
    }
    static async login(req, res) {
        try {
            const { error, value } = LoginService.loginSchema.validate(req.body, {
                abortEarly: false,
            });
            if (error) {
                res
                    .status(422)
                    .json({ success: false, message: error.details[0].message });
                return;
            }
            const { email, password } = value;
            const [rows] = await database_1.pool.query(`SELECT employee_id, password FROM employee_credentials WHERE email = ?`, [email]);
            if (rows.length === 0) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }
            const user = rows[0];
            const isMatch = await Password_Encryption_Decryption_1.PasswordUtil.verifyPassword(password, user.password);
            if (!isMatch) {
                res.status(401).json({ success: false, message: 'Invalid password' });
                return;
            }
            await LoginService.cookieSetter(user.employee_id, email, res);
            const { access_token, refresh_token } = await LoginService.jwtAuth(user.employee_id);
            const tiger = await this.getEmployeeRoles(user.employee_id);
            if (tiger.status === 'success') {
                res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    employee_id: user.employee_id,
                    role: tiger.data[0].role_name,
                    access_token,
                    refresh_token
                });
            }
        }
        catch (error) {
            console.error('Login error:', error);
            res
                .status(500)
                .json({ success: false, message: 'Internal server error' });
        }
    }
    static async cookieSetter(employee_id, email, res) {
        const conn = await database_1.pool.getConnection();
        try {
            await conn.beginTransaction();
            const tokenCheck = await this.resetTokens(employee_id);
            if (!tokenCheck.success) {
                throw new Error('Failed to reset tokens');
            }
            const { access_token, refresh_token } = await LoginService.jwtAuth(employee_id);
            await conn.query(`INSERT INTO jwt_auth (employee_id, access_token, refresh_token, status) VALUES (?, ?, ?, 'active')`, [employee_id, access_token, refresh_token]);
            const tiger = await this.getEmployeeRoles(employee_id);
            if (tiger.status === 'success') {
                res.cookie('role', tiger.data[0].role_name, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000,
                });
            }
            res.cookie('access_token', access_token, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000,
            });
            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
            res.cookie('employee_email', email, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
            });
            res.cookie('id', employee_id, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
            });
            await conn.commit();
        }
        catch (error) {
            await conn.rollback();
            throw error;
        }
        finally {
            conn.release();
        }
    }
    static async invalidateExpiredTokens() {
        try {
            const [tokens] = await database_1.pool.query(`SELECT id, access_token, refresh_token FROM jwt_auth WHERE status = 'active'`);
            for (const token of tokens) {
                try {
                    jsonwebtoken_1.default.verify(token.access_token, env_1.config.JWT_TOKEN);
                    jsonwebtoken_1.default.verify(token.refresh_token, env_1.config.JWT_TOKEN);
                }
                catch (err) {
                    await database_1.pool.query(`UPDATE jwt_auth SET status = 'expired' WHERE id = ?`, [token.id]);
                }
            }
            console.log('Expired tokens invalidated successfully.');
        }
        catch (error) {
            console.error('Error invalidating tokens:', error);
        }
    }
    static async logout(req, res) {
        try {
            const token = req.cookies?.access_token;
            if (!token) {
                res.status(400).json({ success: false, message: 'No active session' });
                return;
            }
            await database_1.pool.query(`UPDATE jwt_auth SET status = 'revoked' WHERE access_token = ?`, [token]);
            res.clearCookie('access_token');
            res.clearCookie('refresh_token');
            res.clearCookie('employee_email');
            res.status(200).json({ success: true, message: 'Logout successful' });
        }
        catch (error) {
            console.error('Logout error:', error);
            res
                .status(500)
                .json({ success: false, message: 'Internal server error' });
        }
    }
    static async refreshToken(req, res) {
        try {
            const refreshToken = req.body?.refresh_token;
            if (!refreshToken) {
                res
                    .status(401)
                    .json({ success: false, message: 'No refresh token provided' });
                return;
            }
            const [tokenRows] = await database_1.pool.query(`SELECT employee_id, status FROM jwt_auth WHERE refresh_token = ?`, [refreshToken]);
            if (tokenRows.length === 0 || tokenRows[0].status !== 'active') {
                res.status(401).json({
                    success: false,
                    message: 'Invalid or expired refresh token',
                });
                return;
            }
            let payload;
            try {
                payload = jsonwebtoken_1.default.verify(refreshToken, env_1.config.JWT_TOKEN);
            }
            catch (err) {
                await database_1.pool.query(`UPDATE jwt_auth SET status = 'expired' WHERE refresh_token = ?`, [refreshToken]);
                res
                    .status(401)
                    .json({ success: false, message: 'Invalid refresh token' });
                return;
            }
            const { employee_id } = payload;
            const [employeeRows] = await database_1.pool.query(`SELECT email FROM employee_credentials WHERE employee_id = ?`, [employee_id]);
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
        }
        catch (error) {
            console.error('Refresh token error:', error);
            res
                .status(500)
                .json({ success: false, message: 'Internal server error' });
        }
    }
    static async jwtAuth(employee_id) {
        if (!env_1.config.JWT_TOKEN) {
            throw new Error('JWT secret is not configured');
        }
        const access_token = jsonwebtoken_1.default.sign({ employee_id }, env_1.config.JWT_TOKEN, {
            expiresIn: '1d',
        });
        const refresh_token = jsonwebtoken_1.default.sign({ employee_id }, env_1.config.JWT_TOKEN, {
            expiresIn: '30d',
        });
        return { access_token, refresh_token };
    }
    static async otpUtil(email) {
        try {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const conn = await database_1.pool.getConnection();
            try {
                await conn.beginTransaction();
                await conn.query(`UPDATE password_change_otp SET status = 'expired' WHERE email = ? AND status = 'active'`, [email]);
                await conn.query(`INSERT INTO password_change_otp (email, otp, status) VALUES (?, ?, 'active')`, [email.toLowerCase(), otp]);
                await conn.commit();
            }
            finally {
                conn.release();
            }
            await (0, mailer_service_1.sendMail)(email, 'Password Reset OTP', `Your OTP is ${otp}`, `<p>Your OTP for password reset is <b>${otp}</b>. It will expire in 5 minutes.</p>
         <a href="https://30.0.0.78:4200/login">Click here to reset your password</a>`);
            return { status: 200, success: true, message: 'OTP sent successfully' };
        }
        catch (err) {
            console.error('Error in otpUtil:', err);
            return { status: 500, success: false, message: 'Internal server error' };
        }
    }
    static async resetTokens(employee_id) {
        const conn = await database_1.pool.getConnection();
        try {
            await conn.beginTransaction();
            const [activeTokens] = await conn.query(`SELECT * FROM jwt_auth WHERE employee_id = ? AND status IN ('active', 'revoked')`, [employee_id]);
            if (activeTokens.length > 0) {
                await conn.query(`DELETE FROM jwt_auth WHERE employee_id = ? AND status IN ('active', 'revoked')`, [employee_id]);
            }
            await conn.commit();
            return {
                success: true,
                deleted: activeTokens.length,
            };
        }
        catch (error) {
            await conn.rollback();
            console.error('Error in resetTokens:', error);
            return {
                success: false,
                message: 'Internal Server Error',
                error: error.message,
            };
        }
        finally {
            conn.release();
        }
    }
    static async isTokenActive(token) {
        try {
            const [rows] = await database_1.pool.query(`SELECT status, createdAt, access_token, refresh_token FROM jwt_auth WHERE access_token = ? OR refresh_token = ?`, [token, token]);
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
        }
        catch (error) {
            console.error('Error checking token status:', error);
            return false;
        }
    }
    static async getEmployeeRoles(employee_id) {
        if (!employee_id || isNaN(employee_id)) {
            return {
                status: 'error',
                message: 'Invalid or missing employee_id.',
            };
        }
        let connection;
        try {
            connection = await database_1.pool.getConnection();
            const [employeeRoles] = await connection.query(`SELECT r.role_id, r.role_name, r.description
       FROM employee_roles er
       JOIN roles r ON er.role_id = r.role_id
       WHERE er.employee_id = ?`, [employee_id]);
            if (employeeRoles.length > 0) {
                return {
                    status: 'success',
                    data: employeeRoles,
                };
            }
            const [jobTitleRoles] = await connection.query(`SELECT r.role_id, r.role_name, r.description
       FROM employment_details ed
       JOIN job_titles jt ON ed.job_title = jt.job_title_name
       JOIN job_title_roles jtr ON jt.job_title_id = jtr.job_title_id
       JOIN roles r ON jtr.role_id = r.role_id
       WHERE ed.employee_id = ?`, [employee_id]);
            if (jobTitleRoles.length > 0) {
                return {
                    status: 'success',
                    data: jobTitleRoles,
                };
            }
            const [departmentRoles] = await connection.query(`SELECT r.role_id, r.role_name, r.description
       FROM employment_details ed
       JOIN departments d ON ed.department = d.department_name
       JOIN department_role dr ON d.department_id = dr.department_id
       JOIN roles r ON dr.role_id = r.role_id
       WHERE ed.employee_id = ?`, [employee_id]);
            if (departmentRoles.length > 0) {
                return {
                    status: 'success',
                    data: departmentRoles,
                };
            }
            return {
                status: 'error',
                message: 'Contact System Admin',
            };
        }
        catch (error) {
            console.error('Error fetching employee roles:', error);
            return {
                status: 'error',
                message: 'An error occurred while retrieving roles. Please try again later.',
            };
        }
        finally {
            if (connection) {
                connection.release();
            }
        }
    }
    // New method for forgot password - send OTP to employees
    static async forgotPwd(req, res) {
        try {
            const { error, value } = LoginService.emailSchema.validate(req.body, {
                abortEarly: false,
            });
            if (error) {
                res.status(422).json({
                    success: false,
                    message: error.details[0].message,
                });
                return;
            }
            const { email } = value;
            // Check if employee exists in employee_credentials (existing users)
            const [credentialRows] = await database_1.pool.query(`SELECT employee_id FROM employee_credentials WHERE LOWER(email) = LOWER(?)`, [email]);
            if (credentialRows.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'No account found with this email address.',
                });
                return;
            }
            // Expire any existing active OTPs for this email
            await database_1.pool.query(`UPDATE password_change_otp SET status = 'expired' WHERE LOWER(email) = LOWER(?) AND status = 'active'`, [email]);
            // Send OTP
            const otpResponse = await LoginService.otpUtil(email);
            if (otpResponse.success) {
                res.status(200).json({
                    success: true,
                    message: 'OTP sent successfully to your email.',
                });
            }
            else {
                res.status(otpResponse.status).json(otpResponse);
            }
        }
        catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error.',
            });
        }
    }
    // New method for changing password of existing employees
    static async changePwd(req, res) {
        const conn = await database_1.pool.getConnection();
        try {
            const { error, value } = LoginService.passwordChangeSchema.validate(req.body, {
                abortEarly: false,
            });
            if (error) {
                res
                    .status(422)
                    .json({ success: false, message: error.details[0].message });
                return;
            }
            const { email, otp, newPassword } = value;
            await conn.beginTransaction();
            // Verify OTP
            const [rows] = await conn.query(`SELECT * FROM password_change_otp WHERE email = ? AND otp = ? AND status = 'active' ORDER BY createdAt DESC LIMIT 1 FOR UPDATE`, [email, otp]);
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
                await conn.query(`UPDATE password_change_otp SET status = 'expired' WHERE sl_no = ?`, [otpRecord.sl_no]);
                await conn.commit();
                res.status(410).json({
                    success: false,
                    message: 'OTP expired. Please request a new one.',
                });
                return;
            }
            // Check if employee exists
            const [employeeRows] = await conn.query(`SELECT employee_id FROM employee_credentials WHERE email = ?`, [email]);
            if (employeeRows.length === 0) {
                await conn.rollback();
                res
                    .status(400)
                    .json({ success: false, message: 'Employee not found.' });
                return;
            }
            const empId = employeeRows[0].employee_id;
            const hashedPassword = await Password_Encryption_Decryption_1.PasswordUtil.hashPassword(newPassword);
            // Update password
            await conn.query(`UPDATE employee_credentials SET password = ? WHERE email = ?`, [hashedPassword, email]);
            // Mark OTP as used
            await conn.query(`UPDATE password_change_otp SET status = 'used' WHERE sl_no = ?`, [otpRecord.sl_no]);
            await conn.commit();
            res.json({
                success: true,
                message: 'Password changed successfully',
            });
        }
        catch (err) {
            console.error('Error in changePwd:', err);
            await conn.rollback();
            res
                .status(500)
                .json({ success: false, message: 'Internal server error' });
        }
        finally {
            conn.release();
        }
    }
}
exports.default = LoginService;
//# sourceMappingURL=employee-login-service.js.map
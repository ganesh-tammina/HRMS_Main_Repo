"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = void 0;
exports.checkWhoAmI = checkWhoAmI;
exports.checkMyRole = checkMyRole;
exports.checkIfIamValidEmployee = checkIfIamValidEmployee;
exports.checkIfIamEmployeeAtAll = checkIfIamEmployeeAtAll;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const employee_login_service_1 = __importDefault(require("../services/employee-login-service"));
function checkWhoAmI(req, res, next) {
    if (req.body.email == env_1.config.ADMIN_ID) {
        IAM_GROOT(req, res, 'LOGIN');
    }
    else
        next();
}
async function checkMyRole(req, res, next) {
    // const employee_ID = await CheckerCrocodile.RoleChecker(req, res);
    // not implemented yet, still work need to be done.
    console.log('check role');
    const id = parseInt(req.cookies?.id);
    if (id != 2026) {
        req.body = { id: id };
        next();
    }
    else
        next();
}
function checkIfIamValidEmployee(req, res, next) {
    if (!req.cookies?.employee_email || !req.cookies?.employee_id) {
        res.json('Nope, invalid request.').status(500);
    }
    else {
        req.body.email = req.cookies?.employee_email;
        next();
    }
}
function checkIfIamEmployeeAtAll(req, res, next) {
    if (!req.body?.email) {
        res.json('Nope, invalid request.').status(500);
    }
    else {
        if (req.body.email === env_1.config.ADMIN_ID) {
            return IAM_GROOT(req, res, 'NOTLOGIN');
        }
        next();
    }
}
async function IAM_GROOT(req, res, type) {
    if (type === 'LOGIN') {
        res.cookie('employee_email', req.body.email);
        res.status(200).json({
            success: true,
            type: 'existing_employee',
            message: 'Existing employee found.',
        });
    }
    else if (type === 'NOTLOGIN') {
        if (req.body.password === env_1.config.ADMIN_PASSWORD) {
            req.body.email = req.cookies?.employee_email;
            const t = await employee_login_service_1.default.login(req, res);
        }
    }
}
const verifyAccessToken = async (req, res, next) => {
    try {
        const token = req.body?.access_token;
        const refreshToken = req.body?.refresh_token;
        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: 'Access token missing' });
        }
        // if (!refreshToken) {
        //   return res
        //     .status(401)
        //     .json({ success: false, message: 'Refresh token missing' });
        // }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.JWT_TOKEN);
        const jwt_check = await employee_login_service_1.default.isTokenActive(token);
        if (jwt_check) {
            req.employee = decoded;
            req.body.id = decoded.employee_id;
            next();
        }
        else {
            req.employee = decoded;
            req.body.id = decoded.employee_id;
            next();
        }
    }
    catch (error) {
        return res
            .status(401)
            .json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.verifyAccessToken = verifyAccessToken;
//# sourceMappingURL=cookie-parser-middleware.js.map
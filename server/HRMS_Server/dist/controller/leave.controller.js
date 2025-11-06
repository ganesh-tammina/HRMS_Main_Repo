"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const leave_services_1 = __importDefault(require("../services/leave.services"));
class LeaveController {
    static async createLeaveBalance(req, res) {
        try {
            const result = await leave_services_1.default.createLeaveBalance(req.body);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
    static async createLeaveRequest(req, res) {
        try {
            const result = await leave_services_1.default.createLeaveRequest(req.body);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
    static async getLeaveBalances(_req, res) {
        console.log('getLeaveBalances called');
        try {
            const result = await leave_services_1.default.getLeaveBalances();
            res.status(200).json(result);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
    static async getLeaveRequests(_req, res) {
        try {
            const result = await leave_services_1.default.getLeaveRequests();
            res.status(200).json(result);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
    static async addLeaves(req, res) {
        try {
            const result = await leave_services_1.default.addLeaves(req.body);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
    static async getLeaves(req, res) {
        try {
            const result = await leave_services_1.default.getLeaveBalance(req.body.employeeId);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
    static async getLeaveRequest(req, res) {
        try {
            const result = await leave_services_1.default.getLeaveRequestID(req.body.employeeId);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}
exports.default = LeaveController;
//# sourceMappingURL=leave.controller.js.map
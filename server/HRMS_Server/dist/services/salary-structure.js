"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const router = express_1.default.Router();
// ✅ POST: Add Salary Structure for a Candidate
router.post('/salary-structure', async (req, res) => {
    try {
        const { candidate_id, basic, hra, medical_allowance, transport_allowance, special_allowance, sub_total, pf_employer, total_annual } = req.body;
        // ✅ Validate candidate_id and required fields
        if (!candidate_id) {
            return res.status(400).json({
                success: false,
                message: 'candidate_id is required.',
            });
        }
        // ✅ Verify candidate exists
        const [candidate] = await database_1.pool.query('SELECT id FROM hrms_master_data.candidates WHERE id = ?', [candidate_id]);
        if (candidate.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found.',
            });
        }
        // ✅ Insert into salary_structure
        const insertQuery = `
			INSERT INTO hrms_master_data.salary_structure 
			(candidate_id, basic, hra, medical_allowance, transport_allowance, special_allowance, sub_total, pf_employer, total_annual)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`;
        const [result] = await database_1.pool.query(insertQuery, [
            candidate_id,
            basic,
            hra,
            medical_allowance,
            transport_allowance,
            special_allowance,
            sub_total,
            pf_employer,
            total_annual
        ]);
        return res.status(201).json({
            success: true,
            message: 'Salary structure added successfully.',
            salary_id: result.insertId,
        });
    }
    catch (error) {
        console.error('❌ Error adding salary structure:', error.sqlMessage || error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while adding salary structure.',
            error: error.sqlMessage || error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=salary-structure.js.map
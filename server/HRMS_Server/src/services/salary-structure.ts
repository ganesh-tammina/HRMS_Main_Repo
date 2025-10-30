import express, { Request, Response } from 'express';
import { pool } from '../config/database';
import { ResultSetHeader } from 'mysql2/promise';

const router = express.Router();

// ✅ POST: Add Salary Structure for a Candidate
router.post('/salary-structure', async (req: Request, res: Response) => {
	try {
		const {
			candidate_id,
			basic,
			hra,
			medical_allowance,
			transport_allowance,
			special_allowance,
			sub_total,
			pf_employer,
			total_annual
		} = req.body;

		// ✅ Validate candidate_id and required fields
		if (!candidate_id) {
			return res.status(400).json({
				success: false,
				message: 'candidate_id is required.',
			});
		}

		// ✅ Verify candidate exists
		const [candidate]: any = await pool.query(
			'SELECT id FROM hrms_master_data.candidates WHERE id = ?',
			[candidate_id]
		);

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

		const [result]: [ResultSetHeader, any] = await pool.query(insertQuery, [
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
	} catch (error: any) {
		console.error('❌ Error adding salary structure:', error.sqlMessage || error.message);
		res.status(500).json({
			success: false,
			message: 'Server error while adding salary structure.',
			error: error.sqlMessage || error.message,
		});
	}
});

export default router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const router = express_1.default.Router();
// ✅ POST: Add a new candidate
router.post('/', async (req, res) => {
    const connection = await database_1.pool.getConnection();
    await connection.beginTransaction();
    try {
        // 👇 Insert new candidate with default status 'pending'
        const [result] = await database_1.pool.query("INSERT INTO hrms_master_data.candidates (dateCreated, status) VALUES (CURDATE(), 'pending')");
        const candidateId = result.insertId;
        const { FirstName, LastName, PhoneNumber, Email, Gender, JobTitle, Department, JobLocation, WorkType, BusinessUnit, } = req.body;
        if (!FirstName || !PhoneNumber || !Email || !Gender) {
            return res.status(400).json({
                success: false,
                message: 'FirstName, PhoneNumber, Email, and Gender are required.',
            });
        }
        const [existing] = await database_1.pool.query('SELECT * FROM hrms_master_data.personal_details WHERE Email = ?', [Email]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A candidate with this email already exists.',
            });
        }
        const insertQuery = `
      INSERT INTO hrms_master_data.personal_details
      (candidate_id, FirstName, LastName, PhoneNumber, Email, Gender, JobTitle, Department, JobLocation, WorkType, BusinessUnit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await database_1.pool.query(insertQuery, [
            candidateId,
            FirstName,
            LastName || '',
            PhoneNumber,
            Email,
            Gender,
            JobTitle || '',
            Department || '',
            JobLocation || '',
            WorkType || '',
            BusinessUnit || '',
        ]);
        await connection.commit();
        res.status(201).json({
            success: true,
            message: 'Candidate added successfully.',
            candidate: {
                ID: candidateId,
                FirstName,
                LastName,
                PhoneNumber,
                Email,
                Gender,
                JobTitle,
                Department,
                JobLocation,
                WorkType,
                BusinessUnit,
                status: 'pending',
            },
        });
    }
    catch (error) {
        await connection.rollback();
        console.error('❌ Error adding candidate:', error.sqlMessage || error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while adding candidate.',
            error: error.sqlMessage || error.message,
        });
    }
    finally {
        connection.release();
    }
});
// ✅ GET: All candidates
router.get('/', async (_req, res) => {
    try {
        const [rows] = await database_1.pool.query(`
      SELECT 
          p.id AS PersonalDetailsID,
          p.candidate_id,
          p.FirstName,
          p.LastName,
          p.PhoneNumber,
          p.Email,
          p.Gender,
          p.JobTitle,
          p.Department,
          p.JobLocation,
          p.WorkType,
          p.BusinessUnit,
          c.dateCreated,
          c.status
      FROM hrms_master_data.personal_details p
      JOIN hrms_master_data.candidates c ON p.candidate_id = c.id
      ORDER BY c.dateCreated DESC
    `);
        res.status(200).json({
            success: true,
            message: 'Candidate list fetched successfully.',
            total: rows.length,
            candidates: rows,
        });
    }
    catch (error) {
        console.error('❌ Error fetching candidates:', error.sqlMessage || error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching candidates.',
            error: error.sqlMessage || error.message,
        });
    }
});
// ✅ GET: Candidate by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await database_1.pool.query(`
      SELECT 
          p.*,
          c.dateCreated,
          c.status
      FROM hrms_master_data.personal_details p
      JOIN hrms_master_data.candidates c ON p.candidate_id = c.id
      WHERE c.id = ?
    `, [id]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Candidate not found for ID: ${id}`,
            });
        }
        res.status(200).json({
            success: true,
            candidate: rows[0],
        });
    }
    catch (error) {
        console.error('❌ Error fetching candidate:', error.sqlMessage || error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching candidate.',
            error: error.sqlMessage || error.message,
        });
    }
});
// ✅ PUT: Update candidate status (accepted / rejected / pending)
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }
    try {
        const [result] = await database_1.pool.query(`UPDATE hrms_master_data.candidates SET status = ? WHERE id = ?`, [status, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Candidate not found.' });
        }
        res.status(200).json({
            success: true,
            message: `Candidate status updated to ${status}`,
        });
    }
    catch (error) {
        console.error('❌ Error updating candidate status:', error.sqlMessage || error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while updating candidate status.',
            error: error.sqlMessage || error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=candidate-service.js.map
import express, { Request, Response } from 'express';
import { pool } from '../config/database';

const router = express.Router();

// ✅ POST: Add a new candidate
router.post('/', async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const [result]: any = await pool.query(
            "INSERT INTO hrms_master_data.candidates (dateCreated) VALUES (CURDATE())"
        );

        const candidateId = result.insertId;

        const {
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
        } = req.body;

        if (!FirstName || !PhoneNumber || !Email || !Gender) {
            return res.status(400).json({
                success: false,
                message: 'FirstName, PhoneNumber, Email, and Gender are required.',
            });
        }

        const [existing]: any = await pool.query(
            'SELECT * FROM hrms_master_data.personal_details WHERE Email = ?',
            [Email]
        );

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

        await pool.query(insertQuery, [
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
            },
        });
    } catch (error: any) {
        await connection.rollback();
        console.error('❌ Error adding candidate:', error.sqlMessage || error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while adding candidate.',
            error: error.sqlMessage || error.message,
        });
    } finally {
        connection.release();
    }
});

// ✅ GET: All candidates
router.get('/', async (_req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query(`
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
          c.dateCreated
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
    } catch (error: any) {
        console.error('❌ Error fetching candidates:', error.sqlMessage || error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching candidates.',
            error: error.sqlMessage || error.message,
        });
    }
});

// ✅ GET: Candidate by ID
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [rows]: any = await pool.query(`
      SELECT 
          p.*,
          c.dateCreated
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
    } catch (error: any) {
        console.error('❌ Error fetching candidate:', error.sqlMessage || error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching candidate.',
            error: error.sqlMessage || error.message,
        });
    }
});

export default router;

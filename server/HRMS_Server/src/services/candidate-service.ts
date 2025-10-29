import express, { Request, Response } from 'express';
import { pool } from '../config/database';

const router = express.Router();

// ✅ POST: Add a new candidate
router.post('/candidates', async (req: Request, res: Response) => {
    const connection = await pool.getConnection(); // get connection for transaction
    await connection.beginTransaction();
    try {
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
            BusinessUnit
        } = req.body;

        // ✅ 1. Validate required fields
        if (!FirstName || !PhoneNumber || !Email || !Gender) {
            return res.status(400).json({
                success: false,
                message: 'FirstName, PhoneNumber, Email, and Gender are required.',
            });
        }

        // ✅ 2. Validate gender
        const validGenders = ['Male', 'Female', 'Other'];
        if (!validGenders.includes(Gender)) {
            return res.status(400).json({
                success: false,
                message: "Gender must be 'Male', 'Female', or 'Other'.",
            });
        }

        // ✅ 3. Check for duplicate email
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

        // ✅ 4. Insert new candidate
        const insertQuery = `
      INSERT INTO hrms_master_data.personal_details
      (FirstName, LastName, PhoneNumber, Email, Gender, JobTitle, Department, JobLocation, WorkType, BusinessUnit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const [result]: any = await pool.query(insertQuery, [
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

        // ✅ 5. Respond with success
        res.status(201).json({
            success: true,
            message: 'Candidate added successfully.',
            candidate: {
                ID: result.insertId,
                FirstName,
                LastName,
                PhoneNumber,
                Email,
                Gender,
                JobTitle,
                Department,
                JobLocation,
                WorkType,
                BusinessUnit
            },
        });
    } catch (error: any) {
        console.error('❌ Error adding candidate:', error.sqlMessage || error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while adding candidate.',
            error: error.sqlMessage || error.message,
        });
    }
});

export default router;

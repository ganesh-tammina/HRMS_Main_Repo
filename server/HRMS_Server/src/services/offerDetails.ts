import express, { Request, Response } from 'express';
import { pool } from '../config/database';

const router = express.Router();

// ✅ POST: Add offer details for a candidate (auto-detect candidate_id)
router.post('/offer-details', async (req: Request, res: Response) => {
    const { Email, JoiningDate, OfferValidity } = req.body;

    // Step 1️⃣: Validate request body
    if (!Email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required to find candidate_id',
        });
    }

    try {
        // Step 2️⃣: Find candidate_id from personal_details
        const [personal]: any = await pool.query(
            `SELECT candidate_id FROM hrms_master_data.personal_details WHERE Email = ?`,
            [Email]
        );

        if (personal.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No candidate found for email: ${Email}`,
            });
        }

        const candidate_id = personal[0].candidate_id;

        // Step 3️⃣: Validate candidate in candidates table
        const [candidateCheck]: any = await pool.query(
            `SELECT id FROM hrms_master_data.candidates WHERE id = ?`,
            [candidate_id]
        );

        if (candidateCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Candidate with id ${candidate_id} not found in candidates table`,
            });
        }

        // Step 4️⃣: Format JoiningDate properly
        const formattedJoiningDate = JoiningDate ? new Date(JoiningDate).toISOString().split('T')[0] : null;

        // Step 5️⃣: Ensure OfferValidity is a number
        const validityDays = OfferValidity ? parseInt(OfferValidity, 10) : null;

        // Step 6️⃣: Insert offer details
        const [result]: any = await pool.query(
            `INSERT INTO hrms_master_data.offer_details (Candidate_id, JoiningDate, OfferValidity)
             VALUES (?, ?, ?)`,
            [candidate_id, formattedJoiningDate, validityDays]
        );

        // Step 7️⃣: Respond success
        res.status(201).json({
            success: true,
            message: 'Offer details created successfully',
            data: {
                offer_id: result.insertId,
                candidate_id,
                Email,
                JoiningDate: formattedJoiningDate,
                OfferValidity: validityDays,
            },
        });
    } catch (error: any) {
        console.error('❌ Error inserting offer details:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while inserting offer details',
            error: error.sqlMessage || error.message,
        });
    }
});

export default router;

import express from 'express';
import { pool } from '../config/database'; // adjust path based on your setup

const router = express.Router();

// ✅ GET all shift policies
router.get('/shift-policies', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM shift_policy');
        res.status(200).json({
            success: true,
            message: 'Shift policies fetched successfully',
            data: rows,
        });
    } catch (error) {
        console.error('Error fetching shift policies:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching shift policies',
            //   error: error.message,
        });
    }
});

export default router;
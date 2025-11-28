import { Request, Response } from "express";
import { RemoteClockIn } from "../interface/remote-clockin-interface";
import { RemoteClockInService } from "../services/remote-clock-in-service";

export class RemoteClockInController {
    public static async createRemoteClockIn(req: Request, res: Response) {
        const remoteClockInData: RemoteClockIn = req.body;
        try {
            const result = await RemoteClockInService.createRemoteClockInRequest(remoteClockInData);
            res.status(201).json({ message: 'Remote clock-in created successfully', data: result });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public static async getRemoteClockInById(req: Request, res: Response) {
        const { id } = req.body;
        try {
            const result = await RemoteClockInService.getRemoteClockInRequestById(id);
            res.status(200).json({ message: 'Remote clock-in records retrieved successfully', data: result });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }   
    }

    public static async getAllRemoteClockIns(req: Request, res: Response) {
        try {
            const result = await RemoteClockInService.getAllRemoteClockInRequests();
            res.status(200).json({ message: 'All remote clock-in records retrieved successfully', data: result });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public static async updateRemoteClockIn(req: Request, res: Response) {
        const { id } = req.body;
        const remoteClockInData: RemoteClockIn = req.body;
        try {
            const result = await RemoteClockInService.updateRemoteClockInRequest(id, remoteClockInData);
            res.status(200).json({ message: 'Remote clock-in updated successfully', data: result });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public static async getRemoteClockInsByDate(req: Request, res: Response) {
        const { date } = req.body;
        try {
            const result = await RemoteClockInService.getRemoteClockInRequestsByDate(date);
            res.status(200).json({ message: 'Remote clock-in records for the date retrieved successfully', data: result });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public static async getRemoteClockInRequests(req: Request, res: Response) {
        const { employee_id } = req.body;
        try {
            const result = await RemoteClockInService.getRemoteClockInRequests(employee_id);
            res.status(200).json({ message: 'Remote clock-in requests retrieved successfully', data: result });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public static async getRemoteClockInsByStatus(req: Request, res: Response) {
        const { status } = req.body;
        try {   
            const result = await RemoteClockInService.getRemoteClockInRequestsByStatus(status);
            res.status(200).json({ message: 'Remote clock-in records for the status retrieved successfully', data: result });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }   
    }

    public static async getRemoteClockInsByManager(req: Request, res: Response) {
        const { notify } = req.body;
        try {
            const result = await RemoteClockInService.getRemoteClockInRequestsByManager(notify);
            res.status(200).json({ message: 'Remote clock-in records for the manager retrieved successfully', data: result });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public static async updateRemoteClockInStatus(req: Request, res: Response) {
        const { id, status } = req.body;
        try {
            const result = await RemoteClockInService.updateRemoteClockInRequestStatus(id, status);
            res.status(200).json({ message: 'Remote clock-in status updated successfully', data: result });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public static async updateRemoteClockInClockOut(req: Request, res: Response) {
        const { id, clock_out } = req.body;
        try {
            const result = await RemoteClockInService.updateRemoteClockInRequestClockOut(id, clock_out);
            res.status(200).json({ message: 'Remote clock-in clock-out time updated successfully', data: result });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    public static async deleteRemoteClockIn(req: Request, res: Response) {
        const { id } = req.body;
        try {
            const result = await RemoteClockInService.deleteRemoteClockInRequest(id);
            res.status(200).json({ message: 'Remote clock-in deleted successfully', data: result });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }   
    }
}  
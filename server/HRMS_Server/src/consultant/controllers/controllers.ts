import { Request, Response } from "express";
import { ConsultantTimesheetService } from "../consultant_service";

export class ConsultantTimesheetController {

    static async create(req: Request, res: Response) {
        try {
            const id = await ConsultantTimesheetService.createTimesheet(req.body);
            res.json({ message: "Timesheet created", id });
        } catch (error) {
            res.status(500).json({ error });
        }
    }

    static async getAll(req: Request, res: Response) {
        try {
            const list = await ConsultantTimesheetService.getAllTimesheets();
            res.json(list);
        } catch (error) {
            res.status(500).json({ error });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const data = await ConsultantTimesheetService.getTimesheetById(Number(req.params.id));
            res.json(data);
        } catch (error) {
            res.status(500).json({ error });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            await ConsultantTimesheetService.updateTimesheet(id, req.body);
            res.json({ message: "Timesheet updated" });
        } catch (error) {
            res.status(500).json({ error });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            await ConsultantTimesheetService.deleteTimesheet(id);
            res.json({ message: "Timesheet deleted" });
        } catch (error) {
            res.status(500).json({ error });
        }
    }
}

import { Request, Response } from "express";
import WeekOffPolicyService from "../services/weekoff.service";

export default class WeekOffPolicyController {
  // Create
  public static async create(req: Request, res: Response) {
    try {
      const result = await WeekOffPolicyService.createPolicy(req.body);
      res.status(201).json({ message: "Week Off Policy created", result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating policy" });
    }
  }

  // Get All
  public static async getAll(req: Request, res: Response) {
    try {
      const result = await WeekOffPolicyService.getAllPolicies();
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching policies" });
    }
  }

  // Get by ID
  public static async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const result = await WeekOffPolicyService.getPolicyById(id);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching policy" });
    }
  }

  // Update
  public static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const result = await WeekOffPolicyService.updatePolicy(id, req.body);
      res.json({ message: "Policy updated", result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating policy" });
    }
  }

  // Delete
  public static async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const result = await WeekOffPolicyService.deletePolicy(id);
      res.json({ message: "Policy deleted", result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting policy" });
    }
  }
}

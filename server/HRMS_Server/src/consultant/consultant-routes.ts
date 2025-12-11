import { Router } from "express";
import { ConsultantTimesheetController } from "./controllers/controllers";

const router = Router();

router.post("/", ConsultantTimesheetController.create);
router.get("/", ConsultantTimesheetController.getAll);
router.get("/:id", ConsultantTimesheetController.getById);
router.put("/:id", ConsultantTimesheetController.update);
router.delete("/:id", ConsultantTimesheetController.delete);

export default router;

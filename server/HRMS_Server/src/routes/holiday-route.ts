import express from "express";
import multer from "multer";
import { HolidayController } from "../holidays/controllers/holidays.controll";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post(
    "/api/v1/holidays/upload",
    upload.single("file"),
    HolidayController.uploadHolidays
);

router.get(
    "/api/v1/holidays",
    HolidayController.getHolidays
);

router.delete(
    "/api/v1/holidays/:id",
    HolidayController.deleteHoliday
);

export default router;

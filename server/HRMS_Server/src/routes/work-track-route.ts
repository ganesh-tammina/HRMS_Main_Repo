import { Router } from 'express';
import { WorkTrackController } from '../work-track/controller/work-track-controller';

export const workTrackRouter = Router();

workTrackRouter.post('/save', WorkTrackController.saveWorkTrack);

workTrackRouter.post('/get-reports', WorkTrackController.getWorkReportsByEmployeeId);

workTrackRouter.post('/get-reports-by-date-range', WorkTrackController.getWorkReportsByDateRange);

 
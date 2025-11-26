import { Router } from 'express';
import { WorkTrackController } from '../work-track/controller/work-track-controller';

export const workTrackRouter = Router();

workTrackRouter.post('/save', WorkTrackController.saveWorkTrack);
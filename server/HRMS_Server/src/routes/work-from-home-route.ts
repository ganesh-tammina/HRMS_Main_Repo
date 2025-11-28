import { Router } from 'express';
import { WorkFromHomeController } from '../controller/work-from-home-controller';

export const workFromHomeRouter = Router();

workFromHomeRouter.post('/v1/apply', WorkFromHomeController.applyWorkFromHome);
workFromHomeRouter.post('/get-by-employee', WorkFromHomeController.getWFHRequestsByEmployeeId);
workFromHomeRouter.get('/get-all', WorkFromHomeController.getAllWFHRequests);
workFromHomeRouter.put('/update-status', WorkFromHomeController.updateWFHRequestStatus);
workFromHomeRouter.delete('/delete', WorkFromHomeController.deleteWFHRequest);



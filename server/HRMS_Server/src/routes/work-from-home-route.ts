import { Router } from 'express';
import { WorkFromHomeController } from '../controller/work-from-home-controller';
import { WFHController } from '../controller/wfh-controller';

export const workFromHomeRouter = Router();

workFromHomeRouter.post('/v1/apply', WorkFromHomeController.applyWorkFromHome);
workFromHomeRouter.get('/v1/get-by-employee/:empId', WorkFromHomeController.getWFHRequestsByEmployeeId);
workFromHomeRouter.get('/v1/get-all', WorkFromHomeController.getAllWFHRequests);
workFromHomeRouter.get('/v1/get-my-notified/:empId', WorkFromHomeController.getMyNotified)
workFromHomeRouter.put('/v1/update-status', WorkFromHomeController.updateWFHRequestStatus);
workFromHomeRouter.delete('/v1/delete', WorkFromHomeController.deleteWFHRequest);

workFromHomeRouter.post('/v1/apply-new', WFHController.applyWorkFromHome);



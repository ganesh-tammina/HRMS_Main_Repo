import { Router } from 'express';
import { RemoteClockInController } from '../controller/remote-clock-in-controller';

export const remoteClockInRouter = Router();

remoteClockInRouter.post('/create', RemoteClockInController.createRemoteClockIn);


/* remoteClockInRouter.post('/get-by-id', RemoteClockInController.getRemoteClockInById);*/
remoteClockInRouter.get('/get-all', RemoteClockInController.getAllRemoteClockIns);

/* remoteClockInRouter.post('/update', RemoteClockInController.updateRemoteClockIn);
remoteClockInRouter.post('/get-by-date', RemoteClockInController.getRemoteClockInsByDate);
remoteClockInRouter.post('/get-requests', RemoteClockInController.getRemoteClockInRequests);
remoteClockInRouter.post('/get-by-status', RemoteClockInController.getRemoteClockInsByStatus);
remoteClockInRouter.post('/get-by-manager', RemoteClockInController.getRemoteClockInsByManager);
remoteClockInRouter.post('/update-status', RemoteClockInController.updateRemoteClockInStatus);
remoteClockInRouter.post('/update-clock-out', RemoteClockInController.updateRemoteClockInClockOut);
*/
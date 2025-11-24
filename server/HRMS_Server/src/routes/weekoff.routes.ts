import { Router } from 'express';
import WeekOffPolicyController from '../controller/weekoff.controller';

const router = Router();

router.post('/', WeekOffPolicyController.create);
router.get('/', WeekOffPolicyController.getAll);
router.get('/:id', WeekOffPolicyController.getById);
router.put('/:id', WeekOffPolicyController.update);
router.delete('/:id', WeekOffPolicyController.delete);
router.get('/emp/:emp_id', WeekOffPolicyController.getByPolicyByEmpId);
export default router;

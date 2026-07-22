import { Router } from 'express';
import { employeeController } from '@controllers/employee.controller';
import { authenticate } from '@middleware/auth';
import { authorize } from '@middleware/authorize';

const router = Router();

// Allow authenticated users to search/list
router.get('/', authenticate, employeeController.list);
router.get('/search', authenticate, employeeController.list);

// Admin / HR role for creating/updating
router.post('/', authenticate, authorize('ADMIN', 'SUPERVISOR'), employeeController.create);

router.get('/:id', authenticate, employeeController.getById);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPERVISOR'), employeeController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), employeeController.delete);

router.get('/:id/history', authenticate, employeeController.getHistory);
router.get('/:id/cases', authenticate, employeeController.getCases);
router.get('/:id/performance', authenticate, authorize('ADMIN', 'SUPERVISOR'), employeeController.getPerformance);
router.get('/:id/activity', authenticate, authorize('ADMIN', 'SUPERVISOR'), employeeController.getActivity);

export default router;

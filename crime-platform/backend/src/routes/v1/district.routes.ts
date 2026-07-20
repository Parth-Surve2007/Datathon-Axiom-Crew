import { Router } from 'express';
import { districtController } from '@controllers/district.controller';
import { authenticate } from '@middleware/auth';
import { authorize } from '@middleware/authorize';

const router = Router();

router.get('/', authenticate, districtController.list);
router.get('/search', authenticate, districtController.list);

router.post('/', authenticate, authorize('ADMIN'), districtController.create);

router.get('/:id', authenticate, districtController.getById);
router.put('/:id', authenticate, authorize('ADMIN'), districtController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), districtController.delete);

router.get('/:id/statistics', authenticate, districtController.getStatistics);
router.get('/:id/dashboard', authenticate, districtController.getDashboard);
router.get('/:id/top-crimes', authenticate, districtController.getTopCrimes);
router.get('/:id/trends', authenticate, districtController.getTrendSummary);

export default router;

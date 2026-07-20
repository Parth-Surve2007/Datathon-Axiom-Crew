import { Router } from 'express';
import { stationController } from '@controllers/station.controller';
import { authenticate } from '@middleware/auth';
import { authorize } from '@middleware/authorize';

const router = Router();

router.get('/', authenticate, stationController.list);
router.get('/search', authenticate, stationController.list);
router.get('/nearby', authenticate, stationController.getNearbyStations);

router.post('/', authenticate, authorize('ADMIN'), stationController.create);

router.get('/:id', authenticate, stationController.getById);
router.put('/:id', authenticate, authorize('ADMIN'), stationController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), stationController.delete);

router.get('/:id/statistics', authenticate, stationController.getStatistics);
router.get('/:id/cases-handled', authenticate, stationController.getCasesHandled);
router.get('/:id/officers', authenticate, stationController.getOfficerCount);
router.get('/:id/crimes', authenticate, stationController.getCrimeCount);

export default router;

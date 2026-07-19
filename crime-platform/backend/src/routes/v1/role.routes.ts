import { Router } from 'express';
import { roleController } from '@controllers/role.controller';
import { validate, authenticate, authorize, asyncHandler } from '@middleware/index';
import { createRoleDtoSchema, queryRolesSchema, roleIdParamSchema } from '@dtos/role.dto';

const router = Router();

// All role endpoints require authentication and ADMIN access
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get(
  '/',
  validate(queryRolesSchema, 'query'),
  asyncHandler(roleController.list)
);

router.post(
  '/',
  validate(createRoleDtoSchema, 'body'),
  asyncHandler(roleController.create)
);

router.get(
  '/:id',
  validate(roleIdParamSchema, 'params'),
  asyncHandler(roleController.getById)
);

router.delete(
  '/:id',
  validate(roleIdParamSchema, 'params'),
  asyncHandler(roleController.delete)
);

export default router;

import { Router } from 'express';
import { userController } from '@controllers/user.controller';
import { validate, authenticate, authorize, asyncHandler } from '@middleware/index';
import { createUserDtoSchema, updateUserDtoSchema, queryUsersSchema, userIdParamSchema } from '@dtos/user.dto';

const router = Router();

// All user endpoints require authentication
router.use(authenticate);

// List users (Admin, Supervisor)
router.get(
  '/',
  authorize('ADMIN', 'SUPERVISOR'),
  validate(queryUsersSchema, 'query'),
  asyncHandler(userController.list)
);

// Create user (Admin only)
router.post(
  '/',
  authorize('ADMIN'),
  validate(createUserDtoSchema, 'body'),
  asyncHandler(userController.create)
);

// Get user by ID (Admin, Supervisor)
router.get(
  '/:id',
  authorize('ADMIN', 'SUPERVISOR'),
  validate(userIdParamSchema, 'params'),
  asyncHandler(userController.getById)
);

// Update user (Admin only)
router.put(
  '/:id',
  authorize('ADMIN'),
  validate(userIdParamSchema, 'params'),
  validate(updateUserDtoSchema, 'body'),
  asyncHandler(userController.update)
);

// Toggle active status (Admin only)
router.patch(
  '/:id/toggle-active',
  authorize('ADMIN'),
  validate(userIdParamSchema, 'params'),
  asyncHandler(userController.toggleActive)
);

export default router;

import { Router } from 'express';
import { authController } from '@controllers/auth.controller';
import { validate, authenticate, asyncHandler } from '@middleware/index';
import { loginDtoSchema, changePasswordDtoSchema } from '@dtos/auth.dto';

const router = Router();

// Public route
router.post(
  '/login',
  validate(loginDtoSchema, 'body'),
  asyncHandler(authController.login)
);

// Protected routes
router.use(authenticate);

router.get(
  '/me',
  asyncHandler(authController.me)
);

router.post(
  '/change-password',
  validate(changePasswordDtoSchema, 'body'),
  asyncHandler(authController.changePassword)
);

export default router;

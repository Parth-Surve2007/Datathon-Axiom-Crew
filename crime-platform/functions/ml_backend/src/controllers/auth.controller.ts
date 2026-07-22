import type { Request, Response } from 'express';
import { authService } from '@services/auth.service';
import { sendSuccess } from '@utils/response';
import { HTTP_STATUS } from '@constants/http';

export const authController = {
  login: async (req: Request, res: Response): Promise<void> => {
    const result = await authService.login(req.body);
    sendSuccess(res, result, { message: 'Login successful' });
  },

  changePassword: async (req: Request, res: Response): Promise<void> => {
    await authService.changePassword(req.user!.id, req.body);
    sendSuccess(res, null, { message: 'Password updated successfully' });
  },

  me: async (req: Request, res: Response): Promise<void> => {
    // Current user context comes from the authenticate middleware
    sendSuccess(res, req.user);
  },
};

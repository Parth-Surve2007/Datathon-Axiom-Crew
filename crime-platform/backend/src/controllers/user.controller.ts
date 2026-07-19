import type { Request, Response } from 'express';
import { userService } from '@services/user.service';
import { sendSuccess, buildPaginationMeta } from '@utils/response';
import { HTTP_STATUS } from '@constants/http';

export const userController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const result = await userService.list(req.query as any);
    const meta = buildPaginationMeta(
      Number(req.query.page) || 1,
      Number(req.query.limit) || 20,
      result.total,
    );
    sendSuccess(res, result.data, { meta });
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const result = await userService.getById(req.params.id);
    sendSuccess(res, result);
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const result = await userService.create(req.body, req.user?.id || null);
    sendSuccess(res, result, { statusCode: HTTP_STATUS.CREATED });
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const result = await userService.update(req.params.id, req.body, req.user?.id || null);
    sendSuccess(res, result);
  },

  toggleActive: async (req: Request, res: Response): Promise<void> => {
    await userService.toggleActive(req.params.id, req.user?.id || null);
    sendSuccess(res, null, { statusCode: HTTP_STATUS.NO_CONTENT });
  },
};

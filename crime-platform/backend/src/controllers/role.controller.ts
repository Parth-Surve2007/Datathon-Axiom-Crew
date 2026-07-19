import type { Request, Response } from 'express';
import { roleService } from '@services/role.service';
import { sendSuccess, buildPaginationMeta } from '@utils/response';
import { HTTP_STATUS } from '@constants/http';

export const roleController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const result = await roleService.list(req.query as any);
    const meta = buildPaginationMeta(
      Number(req.query.page) || 1,
      Number(req.query.limit) || 20,
      result.total,
    );
    sendSuccess(res, result.data, { meta });
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const result = await roleService.getById(req.params.id);
    sendSuccess(res, result);
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const result = await roleService.create(req.body, req.user?.id || null);
    sendSuccess(res, result, { statusCode: HTTP_STATUS.CREATED });
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    await roleService.delete(req.params.id, req.user?.id || null);
    sendSuccess(res, null, { statusCode: HTTP_STATUS.NO_CONTENT });
  },
};

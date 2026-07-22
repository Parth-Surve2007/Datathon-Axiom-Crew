import type { Request, Response, NextFunction } from 'express';
import { districtService } from '@services/district.service';
import { extractPaginationInfo } from '@utils/pagination';

export class DistrictController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = extractPaginationInfo(req);
      const { q, sortBy, sortOrder, stateId } = req.query;

      const result = await districtService.list({
        page,
        limit,
        q: q as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        stateId: stateId as string,
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const district = await districtService.getById(req.params.id);
      res.status(200).json(district);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const district = await districtService.create(req.body, req.user?.id || null);
      res.status(201).json(district);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const district = await districtService.update(req.params.id, req.body, req.user?.id || null);
      res.status(200).json(district);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await districtService.delete(req.params.id, req.user?.id || null);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await districtService.getStatistics(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await districtService.getDashboard(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getTopCrimes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await districtService.getTopCrimes(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getTrendSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await districtService.getTrendSummary(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const districtController = new DistrictController();

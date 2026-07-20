import type { Request, Response, NextFunction } from 'express';
import { stationService } from '@services/station.service';
import { extractPaginationInfo } from '@utils/pagination';

export class StationController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = extractPaginationInfo(req);
      const { q, sortBy, sortOrder, district } = req.query;

      const result = await stationService.list({
        page,
        limit,
        q: q as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        district: district as string,
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const station = await stationService.getById(req.params.id);
      res.status(200).json(station);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const station = await stationService.create(req.body, req.user?.id || null);
      res.status(201).json(station);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const station = await stationService.update(req.params.id, req.body, req.user?.id || null);
      res.status(200).json(station);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await stationService.delete(req.params.id, req.user?.id || null);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async getNearbyStations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lat, lng, radius } = req.query;
      const result = await stationService.getNearbyStations(
        parseFloat(lat as string) || 0,
        parseFloat(lng as string) || 0,
        parseFloat(radius as string) || 10
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await stationService.getStatistics(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getCasesHandled(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await stationService.getCasesHandled(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getOfficerCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await stationService.getOfficerCount(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getCrimeCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await stationService.getCrimeCount(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const stationController = new StationController();

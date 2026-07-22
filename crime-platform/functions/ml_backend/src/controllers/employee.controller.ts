import type { Request, Response, NextFunction } from 'express';
import { employeeService } from '@services/employee.service';
import { extractPaginationInfo } from '@utils/pagination';

export class EmployeeController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = extractPaginationInfo(req);
      const { q, sortBy, sortOrder, stationId, unitId, rankId, isActive } = req.query;

      const result = await employeeService.list({
        page,
        limit,
        q: q as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        stationId: stationId as string,
        unitId: unitId as string,
        rankId: rankId as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await employeeService.getById(req.params.id);
      res.status(200).json(employee);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await employeeService.create(req.body, req.user?.id || null);
      res.status(201).json(employee);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await employeeService.update(req.params.id, req.body, req.user?.id || null);
      res.status(200).json(employee);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await employeeService.delete(req.params.id, req.user?.id || null);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await employeeService.getHistory(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getCases(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await employeeService.getCases(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await employeeService.getPerformance(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await employeeService.getActivity(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const employeeController = new EmployeeController();

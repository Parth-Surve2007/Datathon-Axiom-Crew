import { BaseService } from './base.service';
import { repositoryFactory } from '@repositories/factory';
import { NotFoundError, ConflictError } from '@utils/errors';
import { auditLogger } from '@utils/audit';
import type { CreateEmployeeDto, UpdateEmployeeDto, EmployeeResponse } from '../dtos/employee.dto';
import type { FindManyResult } from '@app-types/index';

export class EmployeeService extends BaseService {
  private employeeRepo = repositoryFactory.getEmployeeRepository();

  constructor() {
    super('EmployeeService');
  }

  async list(query: any): Promise<FindManyResult<EmployeeResponse>> {
    const filters: Record<string, unknown> = {};
    if (query.stationId) filters.station_id = query.stationId;
    if (query.unitId) filters.unit_id = query.unitId;
    if (query.rankId) filters.rank_id = query.rankId;
    if (query.isActive !== undefined) filters.is_active = query.isActive;

    let res;
    if (query.q) {
      res = await this.employeeRepo.search({
        searchColumns: ['name', 'email', 'badge_id'],
        query: query.q,
        page: query.page || 1,
        limit: query.limit || 20,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        filters,
      });
    } else {
      res = await this.employeeRepo.findMany({
        page: query.page || 1,
        limit: query.limit || 20,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        filters,
      });
    }

    return res as FindManyResult<EmployeeResponse>;
  }

  async getById(id: string): Promise<EmployeeResponse> {
    const employee = await this.employeeRepo.findById(id);
    if (!employee) throw new NotFoundError('Employee');
    return employee as EmployeeResponse;
  }

  async create(dto: CreateEmployeeDto, requestUserId: string | null): Promise<EmployeeResponse> {
    const [existingBadge, existingEmail] = await Promise.all([
      this.employeeRepo.findByBadgeId(dto.badgeId),
      this.employeeRepo.findByEmail(dto.email),
    ]);

    if (existingBadge) throw new ConflictError('Badge ID already in use');
    if (existingEmail) throw new ConflictError('Email already in use');

    const created = await this.employeeRepo.create({
      badge_id: dto.badgeId,
      name: dto.name,
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      rank_id: dto.rankId,
      designation_id: dto.designationId,
      station_id: dto.stationId,
      unit_id: dto.unitId,
      is_active: dto.isActive !== false,
      join_date: dto.joinDate,
    });

    await auditLogger.logCreate({
      userId: requestUserId,
      tableName: 'employees',
      recordId: created.id,
      newValues: created,
    });

    return created as EmployeeResponse;
  }

  async update(id: string, dto: UpdateEmployeeDto, requestUserId: string | null): Promise<EmployeeResponse> {
    const employee = await this.employeeRepo.findById(id);
    if (!employee) throw new NotFoundError('Employee');

    const updatePayload: Record<string, unknown> = {};
    if (dto.email && dto.email !== employee.email) {
      const existing = await this.employeeRepo.findByEmail(dto.email);
      if (existing) throw new ConflictError('Email already in use');
      updatePayload.email = dto.email.toLowerCase();
    }
    if (dto.name) updatePayload.name = dto.name;
    if (dto.phone) updatePayload.phone = dto.phone;
    if (dto.rankId) updatePayload.rank_id = dto.rankId;
    if (dto.designationId) updatePayload.designation_id = dto.designationId;
    if (dto.stationId) updatePayload.station_id = dto.stationId;
    if (dto.unitId) updatePayload.unit_id = dto.unitId;
    if (dto.isActive !== undefined) updatePayload.is_active = dto.isActive;
    if (dto.joinDate) updatePayload.join_date = dto.joinDate;

    const updated = await this.employeeRepo.update(id, updatePayload);
    if (!updated) throw new NotFoundError('Employee');

    await auditLogger.logUpdate({
      userId: requestUserId,
      tableName: 'employees',
      recordId: id,
      oldValues: employee,
      newValues: updated,
    });

    return updated as EmployeeResponse;
  }

  async delete(id: string, requestUserId: string | null): Promise<void> {
    const employee = await this.employeeRepo.findById(id);
    if (!employee) throw new NotFoundError('Employee');

    await this.employeeRepo.softDelete(id);

    await auditLogger.logDelete({
      userId: requestUserId,
      tableName: 'employees',
      recordId: id,
      oldValues: employee,
    });
  }

  async getHistory(id: string): Promise<any> {
    // Placeholder for history logic
    return { data: [], total: 0 };
  }

  async getCases(id: string): Promise<any> {
    // Placeholder for cases logic
    return { data: [], total: 0 };
  }

  async getPerformance(id: string): Promise<any> {
    // Placeholder for performance logic
    return { score: 100, casesSolved: 0 };
  }

  async getActivity(id: string): Promise<any> {
    // Placeholder for activity logic
    return { data: [], total: 0 };
  }
}

export const employeeService = new EmployeeService();

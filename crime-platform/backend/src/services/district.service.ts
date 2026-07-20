import { BaseService } from './base.service';
import { repositoryFactory } from '@repositories/factory';
import { NotFoundError, ConflictError } from '@utils/errors';
import { auditLogger } from '@utils/audit';
import type { CreateDistrictDto, UpdateDistrictDto, DistrictResponse } from '../dtos/district.dto';
import type { FindManyResult } from '@app-types/index';

export class DistrictService extends BaseService {
  private districtRepo = repositoryFactory.getDistrictRepository();

  constructor() {
    super('DistrictService');
  }

  async list(query: any): Promise<FindManyResult<DistrictResponse>> {
    const filters: Record<string, unknown> = {};
    if (query.stateId) filters.state_id = query.stateId;

    let res;
    if (query.q) {
      res = await this.districtRepo.search({
        searchColumns: ['name', 'code'],
        query: query.q,
        page: query.page || 1,
        limit: query.limit || 20,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        filters,
      });
    } else {
      res = await this.districtRepo.findMany({
        page: query.page || 1,
        limit: query.limit || 20,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        filters,
      });
    }

    return res as FindManyResult<DistrictResponse>;
  }

  async getById(id: string): Promise<DistrictResponse> {
    const district = await this.districtRepo.findById(id);
    if (!district) throw new NotFoundError('District');
    return district as DistrictResponse;
  }

  async create(dto: CreateDistrictDto, requestUserId: string | null): Promise<DistrictResponse> {
    const existing = await this.districtRepo.findByCode(dto.code);
    if (existing) throw new ConflictError('District code already in use');

    const created = await this.districtRepo.create({
      name: dto.name,
      code: dto.code,
      state_id: dto.stateId,
    });

    await auditLogger.logCreate({
      userId: requestUserId,
      tableName: 'districts',
      recordId: created.id,
      newValues: created,
    });

    return created as DistrictResponse;
  }

  async update(id: string, dto: UpdateDistrictDto, requestUserId: string | null): Promise<DistrictResponse> {
    const district = await this.districtRepo.findById(id);
    if (!district) throw new NotFoundError('District');

    const updatePayload: Record<string, unknown> = {};
    if (dto.code && dto.code !== district.code) {
      const existing = await this.districtRepo.findByCode(dto.code);
      if (existing) throw new ConflictError('District code already in use');
      updatePayload.code = dto.code;
    }
    if (dto.name) updatePayload.name = dto.name;
    if (dto.stateId) updatePayload.state_id = dto.stateId;

    const updated = await this.districtRepo.update(id, updatePayload);
    if (!updated) throw new NotFoundError('District');

    await auditLogger.logUpdate({
      userId: requestUserId,
      tableName: 'districts',
      recordId: id,
      oldValues: district,
      newValues: updated,
    });

    return updated as DistrictResponse;
  }

  async delete(id: string, requestUserId: string | null): Promise<void> {
    const district = await this.districtRepo.findById(id);
    if (!district) throw new NotFoundError('District');

    await this.districtRepo.softDelete(id);

    await auditLogger.logDelete({
      userId: requestUserId,
      tableName: 'districts',
      recordId: id,
      oldValues: district,
    });
  }

  async getStatistics(id: string): Promise<any> {
    // Placeholder for statistics
    return { totalStations: 0, totalCrimes: 0 };
  }

  async getDashboard(id: string): Promise<any> {
    // Placeholder for dashboard
    return { summary: "Dashboard data" };
  }

  async getTopCrimes(id: string): Promise<any> {
    // Placeholder for top crimes
    return { data: [], total: 0 };
  }

  async getTrendSummary(id: string): Promise<any> {
    // Placeholder for trend summary
    return { trend: "up" };
  }
}

export const districtService = new DistrictService();

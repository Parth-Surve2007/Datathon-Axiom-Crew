import { BaseService } from './base.service';
import { repositoryFactory } from '@repositories/factory';
import { NotFoundError, ConflictError } from '@utils/errors';
import { auditLogger } from '@utils/audit';
import type { CreateStationDto, UpdateStationDto, StationResponse } from '../dtos/station.dto';
import type { FindManyResult } from '@app-types/index';

export class StationService extends BaseService {
  private stationRepo = repositoryFactory.getPoliceStationRepository();

  constructor() {
    super('StationService');
  }

  async list(query: any): Promise<FindManyResult<StationResponse>> {
    const filters: Record<string, unknown> = {};
    if (query.district) filters.district = query.district;

    let res;
    if (query.q) {
      res = await this.stationRepo.search({
        searchColumns: ['name', 'code', 'jurisdiction'],
        query: query.q,
        page: query.page || 1,
        limit: query.limit || 20,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        filters,
      });
    } else {
      res = await this.stationRepo.findMany({
        page: query.page || 1,
        limit: query.limit || 20,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        filters,
      });
    }

    return res as FindManyResult<StationResponse>;
  }

  async getById(id: string): Promise<StationResponse> {
    const station = await this.stationRepo.findById(id);
    if (!station) throw new NotFoundError('Police Station');
    return station as StationResponse;
  }

  async create(dto: CreateStationDto, requestUserId: string | null): Promise<StationResponse> {
    const existing = await this.stationRepo.findByCode(dto.code);
    if (existing) throw new ConflictError('Station code already in use');

    const created = await this.stationRepo.create({
      name: dto.name,
      code: dto.code,
      district: dto.district,
      jurisdiction: dto.jurisdiction,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });

    await auditLogger.logCreate({
      userId: requestUserId,
      tableName: 'police_stations',
      recordId: created.id,
      newValues: created,
    });

    return created as StationResponse;
  }

  async update(id: string, dto: UpdateStationDto, requestUserId: string | null): Promise<StationResponse> {
    const station = await this.stationRepo.findById(id);
    if (!station) throw new NotFoundError('Police Station');

    const updatePayload: Record<string, unknown> = {};
    if (dto.code && dto.code !== station.code) {
      const existing = await this.stationRepo.findByCode(dto.code);
      if (existing) throw new ConflictError('Station code already in use');
      updatePayload.code = dto.code;
    }
    if (dto.name) updatePayload.name = dto.name;
    if (dto.district) updatePayload.district = dto.district;
    if (dto.jurisdiction) updatePayload.jurisdiction = dto.jurisdiction;
    if (dto.latitude !== undefined) updatePayload.latitude = dto.latitude;
    if (dto.longitude !== undefined) updatePayload.longitude = dto.longitude;

    const updated = await this.stationRepo.update(id, updatePayload);
    if (!updated) throw new NotFoundError('Police Station');

    await auditLogger.logUpdate({
      userId: requestUserId,
      tableName: 'police_stations',
      recordId: id,
      oldValues: station,
      newValues: updated,
    });

    return updated as StationResponse;
  }

  async delete(id: string, requestUserId: string | null): Promise<void> {
    const station = await this.stationRepo.findById(id);
    if (!station) throw new NotFoundError('Police Station');

    await this.stationRepo.softDelete(id);

    await auditLogger.logDelete({
      userId: requestUserId,
      tableName: 'police_stations',
      recordId: id,
      oldValues: station,
    });
  }

  async getNearbyStations(lat: number, lng: number, radius: number): Promise<StationResponse[]> {
    // Placeholder for PostGIS / bounding box calculation
    return [];
  }

  async getStatistics(id: string): Promise<any> {
    // Placeholder for statistics
    return { totalCases: 0, activeCases: 0 };
  }

  async getCasesHandled(id: string): Promise<any> {
    // Placeholder for cases handled
    return { data: [], total: 0 };
  }

  async getOfficerCount(id: string): Promise<any> {
    // Placeholder for officer count
    return { count: 0 };
  }

  async getCrimeCount(id: string): Promise<any> {
    // Placeholder for crime count
    return { count: 0 };
  }
}

export const stationService = new StationService();

import type { IDistrictRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class CatalystDistrictRepository implements IDistrictRepository {
  async findById(id: string): Promise<any | null> { throw new Error('Not implemented'); }
  async findByIdIncludeDeleted(id: string): Promise<any | null> { throw new Error('Not implemented'); }
  async findMany(params: any): Promise<FindManyResult<any>> { throw new Error('Not implemented'); }
  async create(dto: any): Promise<any> { throw new Error('Not implemented'); }
  async update(id: string, dto: any): Promise<any | null> { throw new Error('Not implemented'); }
  async softDelete(id: string): Promise<boolean> { throw new Error('Not implemented'); }
  async hardDelete(id: string): Promise<boolean> { throw new Error('Not implemented'); }
  async restore(id: string): Promise<any | null> { throw new Error('Not implemented'); }
  async exists(id: string): Promise<boolean> { throw new Error('Not implemented'); }
  async count(filters?: any): Promise<number> { throw new Error('Not implemented'); }
  async bulkCreate(dtos: any[]): Promise<any[]> { throw new Error('Not implemented'); }
  async bulkSoftDelete(ids: string[]): Promise<number> { throw new Error('Not implemented'); }
  async search(params: any): Promise<FindManyResult<any>> { throw new Error('Not implemented'); }

  async findByCode(code: string): Promise<any | null> { throw new Error('Not implemented'); }
  async findByState(stateId: string, params: ListParams): Promise<FindManyResult<any>> { throw new Error('Not implemented'); }
}

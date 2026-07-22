import { CatalystBaseRepository } from './base.catalyst.repository';
import type { IPoliceStationRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class CatalystPoliceStationRepository
  extends CatalystBaseRepository<any>
  implements IPoliceStationRepository
{
  constructor() { super('police_stations'); }

  async findByCode(code: string): Promise<any | null> {
    const zcql = this.app.zcql();
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE code = '${code}' AND deleted_at IS NULL`,
    );
    return res?.[0] ? this.mapRow(res[0]) : null;
  }

  async findByDistrict(district: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const zcql = this.app.zcql();
    const countRes = await zcql.executeZCQLQuery(
      `SELECT count(ROWID) FROM ${this.tableName} WHERE district LIKE '%${district}%' AND deleted_at IS NULL`,
    );
    const total = parseInt(countRes?.[0]?.[this.tableName]?.count ?? '0', 10);
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE district LIKE '%${district}%' AND deleted_at IS NULL LIMIT ${offset}, ${params.limit}`,
    );
    return { data: (res ?? []).map((r: any) => this.mapRow(r)), total };
  }
}

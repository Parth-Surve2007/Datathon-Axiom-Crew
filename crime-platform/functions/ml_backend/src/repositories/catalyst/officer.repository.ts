import { CatalystBaseRepository } from './base.catalyst.repository';
import type { IOfficerRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class CatalystOfficerRepository
  extends CatalystBaseRepository<any>
  implements IOfficerRepository
{
  constructor() { super('officers'); }

  async findByBadgeId(badgeId: string): Promise<any | null> {
    const zcql = this.app.zcql();
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE badge_id = '${badgeId}' AND deleted_at IS NULL`,
    );
    return res?.[0] ? this.mapRow(res[0]) : null;
  }

  async findByStation(stationId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const zcql = this.app.zcql();
    const countRes = await zcql.executeZCQLQuery(
      `SELECT count(ROWID) FROM ${this.tableName} WHERE station_id = '${stationId}' AND deleted_at IS NULL`,
    );
    const total = parseInt(countRes?.[0]?.[this.tableName]?.count ?? '0', 10);
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE station_id = '${stationId}' AND deleted_at IS NULL LIMIT ${offset}, ${params.limit}`,
    );
    return { data: (res ?? []).map((r: any) => this.mapRow(r)), total };
  }
}

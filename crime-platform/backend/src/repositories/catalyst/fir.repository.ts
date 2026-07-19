import { CatalystBaseRepository } from './base.catalyst.repository';
import type { IFirRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';

export class CatalystFirRepository
  extends CatalystBaseRepository<any>
  implements IFirRepository
{
  constructor() {
    super('firs');
  }

  async findByFirNumber(firNumber: string): Promise<any | null> {
    const zcql = this.app.zcql();
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE fir_number = '${firNumber}' AND deleted_at IS NULL`,
    );
    return res?.[0] ? this.mapRow(res[0]) : null;
  }

  async findFirsByStation(stationId: string, page: number, limit: number): Promise<FindManyResult<any>> {
    const offset = (page - 1) * limit;
    const zcql = this.app.zcql();

    const countRes = await zcql.executeZCQLQuery(
      `SELECT count(ROWID) FROM ${this.tableName} WHERE station_id = '${stationId}' AND deleted_at IS NULL`,
    );
    const total = parseInt(countRes?.[0]?.[this.tableName]?.count ?? '0', 10);

    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE station_id = '${stationId}' AND deleted_at IS NULL ORDER BY incident_date DESC LIMIT ${offset}, ${limit}`,
    );
    return { data: (res ?? []).map((r: any) => this.mapRow(r)), total };
  }

  async findByCrimeNumber(crimeNumber: string): Promise<any | null> {
    const zcql = this.app.zcql();
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE crime_number = '${crimeNumber}' AND deleted_at IS NULL`,
    );
    return res?.[0] ? this.mapRow(res[0]) : null;
  }
}

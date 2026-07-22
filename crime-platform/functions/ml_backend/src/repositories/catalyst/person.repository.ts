import { CatalystBaseRepository } from './base.catalyst.repository';
import type { IPersonRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';

export class CatalystPersonRepository
  extends CatalystBaseRepository<any>
  implements IPersonRepository
{
  constructor() { super('persons'); }

  async findByAadhar(aadharNumber: string): Promise<any | null> {
    const zcql = this.app.zcql();
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE aadhar_number = '${aadharNumber}' AND deleted_at IS NULL`,
    );
    return res?.[0] ? this.mapRow(res[0]) : null;
  }

  async searchByName(query: string, page: number, limit: number): Promise<FindManyResult<any>> {
    const offset = (page - 1) * limit;
    const zcql = this.app.zcql();
    const term = `%${query}%`;
    const searchCond = `(first_name LIKE '${term}' OR last_name LIKE '${term}' OR alias LIKE '${term}')`;
    const countRes = await zcql.executeZCQLQuery(
      `SELECT count(ROWID) FROM ${this.tableName} WHERE deleted_at IS NULL AND ${searchCond}`,
    );
    const total = parseInt(countRes?.[0]?.[this.tableName]?.count ?? '0', 10);
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL AND ${searchCond} LIMIT ${offset}, ${limit}`,
    );
    return { data: (res ?? []).map((r: any) => this.mapRow(r)), total };
  }
}

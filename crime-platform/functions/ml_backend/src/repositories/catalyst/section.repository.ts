import { CatalystBaseRepository } from './base.catalyst.repository';
import type { ISectionRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class CatalystSectionRepository
  extends CatalystBaseRepository<any>
  implements ISectionRepository
{
  constructor() { super('sections'); }

  async findByActId(actId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const sortDir = params.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const zcql = this.app.zcql();
    
    const countRes = await zcql.executeZCQLQuery(
      `SELECT count(ROWID) FROM ${this.tableName} WHERE act_id = '${actId}' AND deleted_at IS NULL`,
    );
    const total = parseInt(countRes?.[0]?.[this.tableName]?.count ?? '0', 10);
    
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE act_id = '${actId}' AND deleted_at IS NULL ORDER BY section_code ${sortDir} LIMIT ${offset}, ${params.limit}`,
    );
    return { data: (res ?? []).map((r: any) => this.mapRow(r)), total };
  }

  async findByCode(actId: string, sectionCode: string): Promise<any | null> {
    const zcql = this.app.zcql();
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE act_id = '${actId}' AND section_code = '${sectionCode}' AND deleted_at IS NULL`,
    );
    return res?.[0] ? this.mapRow(res[0]) : null;
  }
}

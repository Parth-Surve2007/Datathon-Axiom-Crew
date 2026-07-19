import { CatalystBaseRepository } from './base.catalyst.repository';
import type { IEvidenceRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class CatalystEvidenceRepository
  extends CatalystBaseRepository<any>
  implements IEvidenceRepository
{
  constructor() { super('evidence'); }

  async findByFirId(firId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const zcql = this.app.zcql();
    const countRes = await zcql.executeZCQLQuery(
      `SELECT count(ROWID) FROM ${this.tableName} WHERE fir_id = '${firId}' AND deleted_at IS NULL`,
    );
    const total = parseInt(countRes?.[0]?.[this.tableName]?.count ?? '0', 10);
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE fir_id = '${firId}' AND deleted_at IS NULL LIMIT ${offset}, ${params.limit}`,
    );
    return { data: (res ?? []).map((r: any) => this.mapRow(r)), total };
  }
}

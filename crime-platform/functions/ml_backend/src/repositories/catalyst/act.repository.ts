import { CatalystBaseRepository } from './base.catalyst.repository';
import type { IActRepository } from '../interfaces';

export class CatalystActRepository
  extends CatalystBaseRepository<any>
  implements IActRepository
{
  constructor() { super('acts'); }

  async findByName(name: string): Promise<any | null> {
    const zcql = this.app.zcql();
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE name LIKE '${name}' AND deleted_at IS NULL`,
    );
    return res?.[0] ? this.mapRow(res[0]) : null;
  }
}

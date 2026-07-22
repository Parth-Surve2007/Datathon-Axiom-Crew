import { CatalystBaseRepository } from './base.catalyst.repository';
import type { ICrimeCategoryRepository } from '../interfaces';

export class CatalystCrimeCategoryRepository
  extends CatalystBaseRepository<any>
  implements ICrimeCategoryRepository
{
  constructor() { super('crime_categories'); }

  async findByName(name: string): Promise<any | null> {
    const zcql = this.app.zcql();
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE name LIKE '${name}' AND deleted_at IS NULL`,
    );
    return res?.[0] ? this.mapRow(res[0]) : null;
  }
}

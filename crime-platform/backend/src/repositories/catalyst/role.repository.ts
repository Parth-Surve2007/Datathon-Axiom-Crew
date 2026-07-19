import { CatalystBaseRepository } from './base.catalyst.repository';
import type { IRoleRepository } from '../interfaces';

export class CatalystRoleRepository
  extends CatalystBaseRepository<any>
  implements IRoleRepository
{
  constructor() { super('roles'); }

  async findByName(name: string): Promise<any | null> {
    const zcql = this.app.zcql();
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE name = '${name.toUpperCase()}'`,
    );
    return res?.[0] ? this.mapRow(res[0]) : null;
  }
}

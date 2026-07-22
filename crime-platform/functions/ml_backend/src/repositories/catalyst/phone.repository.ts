import { CatalystBaseRepository } from './base.catalyst.repository';
import type { IPhoneRepository } from '../interfaces';

export class CatalystPhoneRepository
  extends CatalystBaseRepository<any>
  implements IPhoneRepository
{
  constructor() { super('phones'); }

  async findByPhoneNumber(phoneNumber: string): Promise<any | null> {
    const zcql = this.app.zcql();
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE phone_number = '${phoneNumber}' AND deleted_at IS NULL`,
    );
    return res?.[0] ? this.mapRow(res[0]) : null;
  }
}

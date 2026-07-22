import { CatalystBaseRepository } from './base.catalyst.repository';
import type { IVehicleRepository } from '../interfaces';

export class CatalystVehicleRepository
  extends CatalystBaseRepository<any>
  implements IVehicleRepository
{
  constructor() { super('vehicles'); }

  async findByRegistrationNumber(regNumber: string): Promise<any | null> {
    const zcql = this.app.zcql();
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE registration_number = '${regNumber.toUpperCase()}' AND deleted_at IS NULL`,
    );
    return res?.[0] ? this.mapRow(res[0]) : null;
  }
}

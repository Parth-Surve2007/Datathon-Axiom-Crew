import { PgBaseRepository } from './base.pg.repository';
import type { IVehicleRepository } from '../interfaces';

export class PostgresVehicleRepository
  extends PgBaseRepository<any>
  implements IVehicleRepository
{
  constructor() {
    super('vehicles');
  }

  async findByRegistrationNumber(regNumber: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM vehicles WHERE registration_number = $1 AND deleted_at IS NULL',
      [regNumber.toUpperCase()],
    );
    return res.rows[0] ?? null;
  }
}

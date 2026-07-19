import { PgBaseRepository } from './base.pg.repository';
import type { IPhoneRepository } from '../interfaces';

export class PostgresPhoneRepository
  extends PgBaseRepository<any>
  implements IPhoneRepository
{
  constructor() {
    super('phones');
  }

  async findByPhoneNumber(phoneNumber: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM phones WHERE phone_number = $1 AND deleted_at IS NULL',
      [phoneNumber],
    );
    return res.rows[0] ?? null;
  }
}

import { PgBaseRepository } from './base.pg.repository';
import type { IActRepository } from '../interfaces';

export class PostgresActRepository
  extends PgBaseRepository<any>
  implements IActRepository
{
  constructor() {
    super('acts');
  }

  async findByName(name: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM acts WHERE name ILIKE $1',
      [name],
    );
    return res.rows[0] ?? null;
  }
}

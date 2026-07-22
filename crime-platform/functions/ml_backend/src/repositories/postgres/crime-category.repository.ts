import { PgBaseRepository } from './base.pg.repository';
import type { ICrimeCategoryRepository } from '../interfaces';

export class PostgresCrimeCategoryRepository
  extends PgBaseRepository<any>
  implements ICrimeCategoryRepository
{
  constructor() {
    super('crime_categories');
  }

  async findByName(name: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM crime_categories WHERE name ILIKE $1',
      [name],
    );
    return res.rows[0] ?? null;
  }
}

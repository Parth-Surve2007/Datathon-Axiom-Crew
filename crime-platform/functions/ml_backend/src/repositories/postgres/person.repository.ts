import { PgBaseRepository } from './base.pg.repository';
import type { IPersonRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';

export class PostgresPersonRepository
  extends PgBaseRepository<any>
  implements IPersonRepository
{
  constructor() {
    super('persons');
  }

  async findByAadhar(aadharNumber: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM persons WHERE aadhar_number = $1 AND deleted_at IS NULL',
      [aadharNumber],
    );
    return res.rows[0] ?? null;
  }

  async searchByName(query: string, page: number, limit: number): Promise<FindManyResult<any>> {
    const offset = (page - 1) * limit;
    const searchTerm = `%${query}%`;

    const countRes = await this.pool.query(
      `SELECT COUNT(*) FROM persons
       WHERE deleted_at IS NULL
         AND (first_name ILIKE $1 OR last_name ILIKE $1 OR alias ILIKE $1
              OR (first_name || ' ' || last_name) ILIKE $1)`,
      [searchTerm],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM persons
       WHERE deleted_at IS NULL
         AND (first_name ILIKE $1 OR last_name ILIKE $1 OR alias ILIKE $1
              OR (first_name || ' ' || last_name) ILIKE $1)
       ORDER BY first_name ASC, last_name ASC
       LIMIT $2 OFFSET $3`,
      [searchTerm, limit, offset],
    );

    return { data: res.rows, total };
  }
}

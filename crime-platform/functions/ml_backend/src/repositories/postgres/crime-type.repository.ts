import { PgBaseRepository } from './base.pg.repository';
import type { ICrimeTypeRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class PostgresCrimeTypeRepository
  extends PgBaseRepository<any>
  implements ICrimeTypeRepository
{
  constructor() {
    super('crime_types');
  }

  async findByCategoryId(categoryId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const sortDir = params.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM crime_types WHERE category_id = $1 AND deleted_at IS NULL',
      [categoryId],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM crime_types WHERE category_id = $1 AND deleted_at IS NULL
       ORDER BY name ${sortDir} LIMIT $2 OFFSET $3`,
      [categoryId, params.limit, offset],
    );

    return { data: res.rows, total };
  }
}

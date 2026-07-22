import { PgBaseRepository } from './base.pg.repository';
import type { IDistrictRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class PostgresDistrictRepository
  extends PgBaseRepository<any>
  implements IDistrictRepository
{
  constructor() {
    super('districts');
  }

  async findByCode(code: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM districts WHERE code = $1 AND deleted_at IS NULL',
      [code],
    );
    return res.rows[0] ?? null;
  }

  async findByState(stateId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const sortCol = this.sanitizeColumn(params.sortBy ?? 'name');
    const sortDir = params.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM districts WHERE state_id = $1 AND deleted_at IS NULL',
      [stateId],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM districts WHERE state_id = $1 AND deleted_at IS NULL
       ORDER BY ${sortCol} ${sortDir} LIMIT $2 OFFSET $3`,
      [stateId, params.limit, offset],
    );

    return { data: res.rows, total };
  }
}

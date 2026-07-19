import { PgBaseRepository } from './base.pg.repository';
import type { IOfficerRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class PostgresOfficerRepository
  extends PgBaseRepository<any>
  implements IOfficerRepository
{
  constructor() {
    super('officers');
  }

  async findByBadgeId(badgeId: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM officers WHERE badge_id = $1 AND deleted_at IS NULL',
      [badgeId],
    );
    return res.rows[0] ?? null;
  }

  async findByStation(stationId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const sortCol = this.sanitizeColumn(params.sortBy ?? 'name');
    const sortDir = params.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM officers WHERE station_id = $1 AND deleted_at IS NULL',
      [stationId],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM officers WHERE station_id = $1 AND deleted_at IS NULL
       ORDER BY ${sortCol} ${sortDir} LIMIT $2 OFFSET $3`,
      [stationId, params.limit, offset],
    );

    return { data: res.rows, total };
  }
}

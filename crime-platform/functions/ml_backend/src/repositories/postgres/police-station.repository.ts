import { PgBaseRepository } from './base.pg.repository';
import type { IPoliceStationRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class PostgresPoliceStationRepository
  extends PgBaseRepository<any>
  implements IPoliceStationRepository
{
  constructor() {
    super('police_stations');
  }

  async findByCode(code: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM police_stations WHERE code = $1 AND deleted_at IS NULL',
      [code],
    );
    return res.rows[0] ?? null;
  }

  async findByDistrict(district: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const sortCol = this.sanitizeColumn(params.sortBy ?? 'name');
    const sortDir = params.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM police_stations WHERE district ILIKE $1 AND deleted_at IS NULL',
      [`%${district}%`],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM police_stations WHERE district ILIKE $1 AND deleted_at IS NULL
       ORDER BY ${sortCol} ${sortDir} LIMIT $2 OFFSET $3`,
      [`%${district}%`, params.limit, offset],
    );

    return { data: res.rows, total };
  }
}

import { PgBaseRepository } from './base.pg.repository';
import type { IEmployeeRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class PostgresEmployeeRepository
  extends PgBaseRepository<any>
  implements IEmployeeRepository
{
  constructor() {
    super('employees');
  }

  async findByBadgeId(badgeId: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM employees WHERE badge_id = $1 AND deleted_at IS NULL',
      [badgeId],
    );
    return res.rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM employees WHERE email = $1 AND deleted_at IS NULL',
      [email],
    );
    return res.rows[0] ?? null;
  }

  async findByStation(stationId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const sortCol = this.sanitizeColumn(params.sortBy ?? 'name');
    const sortDir = params.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM employees WHERE station_id = $1 AND deleted_at IS NULL',
      [stationId],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM employees WHERE station_id = $1 AND deleted_at IS NULL
       ORDER BY ${sortCol} ${sortDir} LIMIT $2 OFFSET $3`,
      [stationId, params.limit, offset],
    );

    return { data: res.rows, total };
  }

  async findByUnit(unitId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const sortCol = this.sanitizeColumn(params.sortBy ?? 'name');
    const sortDir = params.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM employees WHERE unit_id = $1 AND deleted_at IS NULL',
      [unitId],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM employees WHERE unit_id = $1 AND deleted_at IS NULL
       ORDER BY ${sortCol} ${sortDir} LIMIT $2 OFFSET $3`,
      [unitId, params.limit, offset],
    );

    return { data: res.rows, total };
  }
}

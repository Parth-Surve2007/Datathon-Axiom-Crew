import { PgBaseRepository } from './base.pg.repository';
import type { ITimelineEventRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class PostgresTimelineEventRepository
  extends PgBaseRepository<any>
  implements ITimelineEventRepository
{
  constructor() {
    super('timeline_events');
  }

  async findByFirId(firId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const sortDir = params.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM timeline_events WHERE fir_id = $1 AND deleted_at IS NULL',
      [firId],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM timeline_events WHERE fir_id = $1 AND deleted_at IS NULL
       ORDER BY occurred_at ${sortDir} LIMIT $2 OFFSET $3`,
      [firId, params.limit, offset],
    );

    return { data: res.rows, total };
  }
}

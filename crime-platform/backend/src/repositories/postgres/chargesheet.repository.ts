import { PgBaseRepository } from './base.pg.repository';
import type { IChargesheetRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class PostgresChargesheetRepository
  extends PgBaseRepository<any>
  implements IChargesheetRepository
{
  constructor() {
    super('chargesheets');
  }

  async findByFirId(firId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM chargesheets WHERE fir_id = $1 AND deleted_at IS NULL',
      [firId],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM chargesheets WHERE fir_id = $1 AND deleted_at IS NULL
       ORDER BY filed_date DESC LIMIT $2 OFFSET $3`,
      [firId, params.limit, offset],
    );

    return { data: res.rows, total };
  }
}

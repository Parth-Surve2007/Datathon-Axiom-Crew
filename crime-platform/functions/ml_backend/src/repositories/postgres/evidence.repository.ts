import { PgBaseRepository } from './base.pg.repository';
import type { IEvidenceRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class PostgresEvidenceRepository
  extends PgBaseRepository<any>
  implements IEvidenceRepository
{
  constructor() {
    super('evidence');
  }

  async findByFirId(firId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const sortCol = this.sanitizeColumn(params.sortBy ?? 'collection_date');
    const sortDir = params.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM evidence WHERE fir_id = $1 AND deleted_at IS NULL',
      [firId],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM evidence WHERE fir_id = $1 AND deleted_at IS NULL
       ORDER BY ${sortCol} ${sortDir} LIMIT $2 OFFSET $3`,
      [firId, params.limit, offset],
    );

    return { data: res.rows, total };
  }
}

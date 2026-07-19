import { PgBaseRepository } from './base.pg.repository';
import type { IDocumentRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class PostgresDocumentRepository
  extends PgBaseRepository<any>
  implements IDocumentRepository
{
  constructor() {
    super('documents');
  }

  async findByFirId(firId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const sortDir = params.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM documents WHERE fir_id = $1 AND deleted_at IS NULL',
      [firId],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM documents WHERE fir_id = $1 AND deleted_at IS NULL
       ORDER BY created_at ${sortDir} LIMIT $2 OFFSET $3`,
      [firId, params.limit, offset],
    );

    return { data: res.rows, total };
  }
}

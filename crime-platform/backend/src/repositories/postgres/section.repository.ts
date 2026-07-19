import { PgBaseRepository } from './base.pg.repository';
import type { ISectionRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class PostgresSectionRepository
  extends PgBaseRepository<any>
  implements ISectionRepository
{
  constructor() {
    super('sections');
  }

  async findByActId(actId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const sortDir = params.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM sections WHERE act_id = $1',
      [actId],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM sections WHERE act_id = $1
       ORDER BY section_code ${sortDir} LIMIT $2 OFFSET $3`,
      [actId, params.limit, offset],
    );

    return { data: res.rows, total };
  }

  async findByCode(actId: string, sectionCode: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM sections WHERE act_id = $1 AND section_code = $2',
      [actId, sectionCode],
    );
    return res.rows[0] ?? null;
  }
}

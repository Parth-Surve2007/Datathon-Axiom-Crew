import { PgBaseRepository } from './base.pg.repository';
import type { ICourtCaseRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class PostgresCourtCaseRepository
  extends PgBaseRepository<any>
  implements ICourtCaseRepository
{
  constructor() {
    super('court_cases');
  }

  async findByFirId(firId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM court_cases WHERE fir_id = $1 AND deleted_at IS NULL',
      [firId],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM court_cases WHERE fir_id = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [firId, params.limit, offset],
    );

    return { data: res.rows, total };
  }

  async findByCaseNumber(caseNumber: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM court_cases WHERE case_number = $1 AND deleted_at IS NULL',
      [caseNumber],
    );
    return res.rows[0] ?? null;
  }
}

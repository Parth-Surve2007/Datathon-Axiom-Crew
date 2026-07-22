import { getPgPool } from '@config/database';
import { createLogger } from '@config/logger';
import type { IAuditLogRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

const log = createLogger('PostgresAuditLogRepository');

export class PostgresAuditLogRepository implements IAuditLogRepository {
  private readonly pool = getPgPool();

  async findByEntity(tableName: string, recordId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;

    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM audit_logs WHERE table_name = $1 AND record_id = $2',
      [tableName, recordId],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM audit_logs WHERE table_name = $1 AND record_id = $2
       ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
      [tableName, recordId, params.limit, offset],
    );

    return { data: res.rows, total };
  }

  async findByUser(userId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;

    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM audit_logs WHERE user_id = $1',
      [userId],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM audit_logs WHERE user_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, params.limit, offset],
    );

    return { data: res.rows, total };
  }

  async findMany(params: ListParams & { filters?: Record<string, unknown> }): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;

    const countRes = await this.pool.query('SELECT COUNT(*) FROM audit_logs');
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [params.limit, offset],
    );

    return { data: res.rows, total };
  }
}

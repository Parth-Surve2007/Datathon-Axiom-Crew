import { Pool, PoolClient } from 'pg';
import { getPgPool } from '@config/database';
import { createLogger } from '@config/logger';
import { NotFoundError } from '@utils/errors';
import type { FindManyResult } from '@app-types/index';

const log = createLogger('PgBaseRepository');

/**
 * Concrete base PostgreSQL repository.
 *
 * All domain Postgres repositories extend this class instead of
 * duplicating boilerplate. Provides:
 *  - findById / findMany / create / update / softDelete / restore
 *  - bulkCreate / bulkDelete
 *  - search (full-text via pg_trgm ILIKE or exact match)
 *  - withTransaction helper
 *
 * All queries use parameterized placeholders — never string interpolation.
 * All read queries include `deleted_at IS NULL` unless explicitly bypassed.
 */
export abstract class PgBaseRepository<TEntity> {
  protected readonly pool: Pool;
  protected readonly tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.pool = getPgPool();
    log.debug({ table: tableName }, 'PgBaseRepository initialised');
  }

  // ─── Core CRUD ─────────────────────────────────────────────────────────────

  async findById(id: string): Promise<TEntity | null> {
    const res = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return (res.rows[0] as TEntity) ?? null;
  }

  async findByIdIncludeDeleted(id: string): Promise<TEntity | null> {
    const res = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id],
    );
    return (res.rows[0] as TEntity) ?? null;
  }

  async findMany(params: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, unknown>;
  }): Promise<FindManyResult<TEntity>> {
    const offset = (params.page - 1) * params.limit;
    const sortCol = this.sanitizeColumn(params.sortBy ?? 'created_at');
    const sortDir = params.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const { whereClause, values } = this.buildFilterClause(params.filters ?? {});

    const countRes = await this.pool.query(
      `SELECT COUNT(*) FROM ${this.tableName} WHERE deleted_at IS NULL ${whereClause}`,
      values,
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const dataRes = await this.pool.query(
      `SELECT * FROM ${this.tableName}
       WHERE deleted_at IS NULL ${whereClause}
       ORDER BY ${sortCol} ${sortDir}
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, params.limit, offset],
    );

    return { data: dataRes.rows as TEntity[], total };
  }

  async create(dto: Record<string, unknown>): Promise<TEntity> {
    const keys = Object.keys(dto);
    const vals = Object.values(dto);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const res = await this.pool.query(
      `INSERT INTO ${this.tableName} (${keys.join(', ')})
       VALUES (${placeholders})
       RETURNING *`,
      vals,
    );
    return res.rows[0] as TEntity;
  }

  async update(id: string, dto: Record<string, unknown>): Promise<TEntity | null> {
    if (Object.keys(dto).length === 0) return this.findById(id);

    const keys = Object.keys(dto);
    const vals = Object.values(dto);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');

    const res = await this.pool.query(
      `UPDATE ${this.tableName}
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id, ...vals],
    );
    return (res.rows[0] as TEntity) ?? null;
  }

  async softDelete(id: string): Promise<boolean> {
    const res = await this.pool.query(
      `UPDATE ${this.tableName}
       SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return (res.rowCount ?? 0) > 0;
  }

  async restore(id: string): Promise<TEntity | null> {
    const res = await this.pool.query(
      `UPDATE ${this.tableName}
       SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NOT NULL
       RETURNING *`,
      [id],
    );
    return (res.rows[0] as TEntity) ?? null;
  }

  async hardDelete(id: string): Promise<boolean> {
    const res = await this.pool.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id],
    );
    return (res.rowCount ?? 0) > 0;
  }

  // ─── Bulk Operations ───────────────────────────────────────────────────────

  async bulkCreate(dtos: Record<string, unknown>[]): Promise<TEntity[]> {
    if (dtos.length === 0) return [];
    const client = await this.pool.connect();
    const results: TEntity[] = [];
    try {
      await client.query('BEGIN');
      for (const dto of dtos) {
        const keys = Object.keys(dto);
        const vals = Object.values(dto);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const res = await client.query(
          `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
          vals,
        );
        results.push(res.rows[0] as TEntity);
      }
      await client.query('COMMIT');
      return results;
    } catch (err) {
      await client.query('ROLLBACK');
      log.error({ err, table: this.tableName }, 'bulkCreate transaction rolled back');
      throw err;
    } finally {
      client.release();
    }
  }

  async bulkSoftDelete(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const res = await this.pool.query(
      `UPDATE ${this.tableName}
       SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
      ids,
    );
    return res.rowCount ?? 0;
  }

  // ─── Search ────────────────────────────────────────────────────────────────

  /**
   * Full-text search using pg_trgm ILIKE across specified columns.
   */
  async search(params: {
    searchColumns: string[];
    query: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, unknown>;
  }): Promise<FindManyResult<TEntity>> {
    const offset = (params.page - 1) * params.limit;
    const sortCol = this.sanitizeColumn(params.sortBy ?? 'created_at');
    const sortDir = params.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const safeSearchTerm = `%${params.query}%`;
    const searchCondition = params.searchColumns
      .map(col => `${this.sanitizeColumn(col)} ILIKE $1`)
      .join(' OR ');

    const { whereClause, values } = this.buildFilterClause(params.filters ?? {}, 1);
    const allValues = [safeSearchTerm, ...values];

    const baseWhere = `WHERE deleted_at IS NULL AND (${searchCondition}) ${whereClause}`;

    const countRes = await this.pool.query(
      `SELECT COUNT(*) FROM ${this.tableName} ${baseWhere}`,
      allValues,
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const dataRes = await this.pool.query(
      `SELECT * FROM ${this.tableName} ${baseWhere}
       ORDER BY ${sortCol} ${sortDir}
       LIMIT $${allValues.length + 1} OFFSET $${allValues.length + 2}`,
      [...allValues, params.limit, offset],
    );

    return { data: dataRes.rows as TEntity[], total };
  }

  async count(filters?: Record<string, unknown>): Promise<number> {
    const { whereClause, values } = this.buildFilterClause(filters ?? {});
    const res = await this.pool.query(
      `SELECT COUNT(*) FROM ${this.tableName} WHERE deleted_at IS NULL ${whereClause}`,
      values,
    );
    return parseInt(res.rows[0].count, 10);
  }

  async exists(id: string): Promise<boolean> {
    const res = await this.pool.query(
      `SELECT 1 FROM ${this.tableName} WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return (res.rowCount ?? 0) > 0;
  }

  // ─── Transaction Helper ────────────────────────────────────────────────────

  async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      log.error({ err, table: this.tableName }, 'Transaction rolled back');
      throw err;
    } finally {
      client.release();
    }
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  /**
   * Builds a parameterized WHERE clause for filter key=value pairs.
   * Starts parameter numbering from `startIndex` (default 1).
   * Returns the clause string (starting with AND) and the values array.
   */
  protected buildFilterClause(
    filters: Record<string, unknown>,
    startIndex = 1,
  ): { whereClause: string; values: unknown[] } {
    const entries = Object.entries(filters).filter(([, v]) => v !== undefined && v !== null);
    if (entries.length === 0) return { whereClause: '', values: [] };

    const clauses: string[] = [];
    const values: unknown[] = [];
    let idx = startIndex;

    for (const [key, val] of entries) {
      const col = this.sanitizeColumn(key);
      clauses.push(`AND ${col} = $${idx++}`);
      values.push(val);
    }

    return { whereClause: clauses.join(' '), values };
  }

  /**
   * Strip non-alphanumeric/underscore chars to prevent SQL injection
   * via column name interpolation.
   */
  protected sanitizeColumn(col: string): string {
    return col.replace(/[^a-zA-Z0-9_.]/g, '');
  }
}

import { getCatalystApp } from '@config/database';
import { createLogger } from '@config/logger';
import type { FindManyResult } from '@app-types/index';

const log = createLogger('CatalystBaseRepository');

/**
 * Concrete base Catalyst (Zoho Data Store + ZCQL) repository.
 *
 * All domain Catalyst repositories extend this class to avoid duplicating
 * boilerplate ZCQL queries. The Catalyst SDK uses ROWID instead of uuid `id`,
 * so all methods translate between the two.
 *
 * NOTE: Catalyst Data Store does not support native soft-delete. This
 * implementation stores a `deleted_at` string column for consistency.
 */
export abstract class CatalystBaseRepository<TEntity> {
  protected readonly app: any;
  protected readonly tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.app = getCatalystApp();
    log.debug({ table: tableName }, 'CatalystBaseRepository initialised');
  }

  // ─── Core CRUD ─────────────────────────────────────────────────────────────

  async findById(id: string): Promise<TEntity | null> {
    try {
      const zcql = this.app.zcql();
      const res = await zcql.executeZCQLQuery(
        `SELECT * FROM ${this.tableName} WHERE ROWID = '${id}' AND deleted_at IS NULL`,
      );
      if (!res || res.length === 0) return null;
      return this.mapRow(res[0]);
    } catch (err) {
      log.error({ err, table: this.tableName, id }, 'findById failed');
      return null;
    }
  }

  async findByIdIncludeDeleted(id: string): Promise<TEntity | null> {
    try {
      const zcql = this.app.zcql();
      const res = await zcql.executeZCQLQuery(
        `SELECT * FROM ${this.tableName} WHERE ROWID = '${id}'`,
      );
      if (!res || res.length === 0) return null;
      return this.mapRow(res[0]);
    } catch (err) {
      log.error({ err, table: this.tableName, id }, 'findByIdIncludeDeleted failed');
      return null;
    }
  }

  async findMany(params: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, unknown>;
  }): Promise<FindManyResult<TEntity>> {
    const offset = (params.page - 1) * params.limit;
    try {
      const zcql = this.app.zcql();
      const filterStr = this.buildFilterString(params.filters ?? {});
      const sortClause = params.sortBy
        ? `ORDER BY ${params.sortBy} ${params.sortOrder === 'asc' ? 'ASC' : 'DESC'}`
        : '';

      const countRes = await zcql.executeZCQLQuery(
        `SELECT count(ROWID) FROM ${this.tableName} WHERE deleted_at IS NULL ${filterStr}`,
      );
      const total = parseInt(countRes?.[0]?.[this.tableName]?.count ?? '0', 10);

      const dataRes = await zcql.executeZCQLQuery(
        `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL ${filterStr} ${sortClause} LIMIT ${offset}, ${params.limit}`,
      );
      const data = (dataRes ?? []).map((row: any) => this.mapRow(row));

      return { data, total };
    } catch (err) {
      log.error({ err, table: this.tableName }, 'findMany failed');
      return { data: [], total: 0 };
    }
  }

  async create(dto: Record<string, unknown>): Promise<TEntity> {
    try {
      const datastore = this.app.datastore();
      const table = datastore.table(this.tableName);
      const row = await table.insertRow(dto);
      return this.mapRow({ [this.tableName]: row });
    } catch (err) {
      log.error({ err, table: this.tableName }, 'create failed');
      throw err;
    }
  }

  async update(id: string, dto: Record<string, unknown>): Promise<TEntity | null> {
    try {
      const datastore = this.app.datastore();
      const table = datastore.table(this.tableName);
      const updateData = { ROWID: id, ...dto };
      const row = await table.updateRow(updateData);
      return this.mapRow({ [this.tableName]: row });
    } catch (err) {
      log.error({ err, table: this.tableName, id }, 'update failed');
      throw err;
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      const datastore = this.app.datastore();
      const table = datastore.table(this.tableName);
      await table.updateRow({ ROWID: id, deleted_at: new Date().toISOString() });
      return true;
    } catch (err) {
      log.error({ err, table: this.tableName, id }, 'softDelete failed');
      return false;
    }
  }

  async hardDelete(id: string): Promise<boolean> {
    try {
      const datastore = this.app.datastore();
      const table = datastore.table(this.tableName);
      await table.deleteRow(id);
      return true;
    } catch (err) {
      log.error({ err, table: this.tableName, id }, 'hardDelete failed');
      return false;
    }
  }

  async restore(id: string): Promise<TEntity | null> {
    try {
      const datastore = this.app.datastore();
      const table = datastore.table(this.tableName);
      const row = await table.updateRow({ ROWID: id, deleted_at: null });
      return this.mapRow({ [this.tableName]: row });
    } catch (err) {
      log.error({ err, table: this.tableName, id }, 'restore failed');
      return null;
    }
  }

  async exists(id: string): Promise<boolean> {
    const row = await this.findById(id);
    return row !== null;
  }

  async count(filters?: Record<string, unknown>): Promise<number> {
    try {
      const zcql = this.app.zcql();
      const filterStr = this.buildFilterString(filters ?? {});
      const countRes = await zcql.executeZCQLQuery(
        `SELECT count(ROWID) FROM ${this.tableName} WHERE deleted_at IS NULL ${filterStr}`,
      );
      return parseInt(countRes?.[0]?.[this.tableName]?.count ?? '0', 10);
    } catch (err) {
      log.error({ err, table: this.tableName }, 'count failed');
      return 0;
    }
  }

  async bulkCreate(dtos: Record<string, unknown>[]): Promise<TEntity[]> {
    const results: TEntity[] = [];
    for (const dto of dtos) {
      results.push(await this.create(dto));
    }
    return results;
  }

  async bulkSoftDelete(ids: string[]): Promise<number> {
    let count = 0;
    for (const id of ids) {
      const ok = await this.softDelete(id);
      if (ok) count++;
    }
    return count;
  }

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
    try {
      const zcql = this.app.zcql();
      const searchConditions = params.searchColumns
        .map(col => `${col} LIKE '%${params.query}%'`)
        .join(' OR ');
      const filterStr = this.buildFilterString(params.filters ?? {});

      const countRes = await zcql.executeZCQLQuery(
        `SELECT count(ROWID) FROM ${this.tableName} WHERE deleted_at IS NULL AND (${searchConditions}) ${filterStr}`,
      );
      const total = parseInt(countRes?.[0]?.[this.tableName]?.count ?? '0', 10);

      const dataRes = await zcql.executeZCQLQuery(
        `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL AND (${searchConditions}) ${filterStr} LIMIT ${offset}, ${params.limit}`,
      );
      const data = (dataRes ?? []).map((row: any) => this.mapRow(row));

      return { data, total };
    } catch (err) {
      log.error({ err, table: this.tableName }, 'search failed');
      return { data: [], total: 0 };
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Maps the Catalyst ZCQL row structure (e.g. `{ tableName: { field: val } }`)
   * to a flat entity object.
   */
  protected mapRow(row: any): TEntity {
    const inner = row[this.tableName] ?? row;
    // Normalize ROWID → id
    if (inner.ROWID && !inner.id) {
      inner.id = String(inner.ROWID);
    }
    return inner as TEntity;
  }

  /**
   * Builds a ZCQL filter string from key/value pairs (AND conditions).
   * Values are quoted for string safety — this is only called with trusted,
   * already-validated data from the service layer.
   */
  protected buildFilterString(filters: Record<string, unknown>): string {
    return Object.entries(filters)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `AND ${k} = '${String(v)}'`)
      .join(' ');
  }
}

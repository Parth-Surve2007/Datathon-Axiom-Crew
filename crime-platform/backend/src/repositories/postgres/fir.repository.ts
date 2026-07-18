import { Pool } from 'pg';
import { getPgPool } from '../../config/database';
import type { IFirRepository } from '../interfaces';
import type { FindManyResult } from '../../types/index';
import { createLogger } from '../../config/logger';

const log = createLogger('PostgresFirRepository');

export class PostgresFirRepository implements IFirRepository {
  private pool: Pool;

  constructor() {
    this.pool = getPgPool();
  }

  async findById(id: string): Promise<any | null> {
    const res = await this.pool.query('SELECT * FROM firs WHERE id = $1 AND deleted_at IS NULL', [id]);
    return res.rows[0] || null;
  }

  async findMany(params: { page: number; limit: number }): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    
    const countRes = await this.pool.query('SELECT count(*) FROM firs WHERE deleted_at IS NULL');
    const total = parseInt(countRes.rows[0].count, 10);
    
    const res = await this.pool.query(
      'SELECT * FROM firs WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [params.limit, offset]
    );
    
    return {
      data: res.rows,
      total
    };
  }

  async create(dto: any): Promise<any> {
    const keys = Object.keys(dto);
    const values = Object.values(dto);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO firs (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const res = await this.pool.query(query, values);
    return res.rows[0];
  }

  async update(id: string, dto: any): Promise<any | null> {
    const keys = Object.keys(dto);
    const values = Object.values(dto);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    
    const query = `
      UPDATE firs
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    
    const res = await this.pool.query(query, [id, ...values]);
    return res.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.pool.query(
      'UPDATE firs SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async findByFirNumber(firNumber: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM firs WHERE fir_number = $1 AND deleted_at IS NULL',
      [firNumber]
    );
    return res.rows[0] || null;
  }

  async findFirsByStation(stationId: string, page: number, limit: number): Promise<FindManyResult<any>> {
    const offset = (page - 1) * limit;
    
    const countRes = await this.pool.query(
      'SELECT count(*) FROM firs WHERE station_id = $1 AND deleted_at IS NULL',
      [stationId]
    );
    const total = parseInt(countRes.rows[0].count, 10);
    
    const res = await this.pool.query(
      'SELECT * FROM firs WHERE station_id = $1 AND deleted_at IS NULL ORDER BY incident_date DESC LIMIT $2 OFFSET $3',
      [stationId, limit, offset]
    );
    
    return {
      data: res.rows,
      total
    };
  }
}

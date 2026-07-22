import { PgBaseRepository } from './base.pg.repository';
import type { IFirRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';

export class PostgresFirRepository
  extends PgBaseRepository<any>
  implements IFirRepository
{
  constructor() {
    super('firs');
  }

  async findByFirNumber(firNumber: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM firs WHERE fir_number = $1 AND deleted_at IS NULL',
      [firNumber],
    );
    return res.rows[0] ?? null;
  }

  async findFirsByStation(stationId: string, page: number, limit: number): Promise<FindManyResult<any>> {
    const offset = (page - 1) * limit;

    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM firs WHERE station_id = $1 AND deleted_at IS NULL',
      [stationId],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM firs WHERE station_id = $1 AND deleted_at IS NULL
       ORDER BY incident_date DESC LIMIT $2 OFFSET $3`,
      [stationId, limit, offset],
    );

    return { data: res.rows, total };
  }

  async findByCrimeNumber(crimeNumber: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM firs WHERE crime_number = $1 AND deleted_at IS NULL',
      [crimeNumber],
    );
    return res.rows[0] ?? null;
  }
}

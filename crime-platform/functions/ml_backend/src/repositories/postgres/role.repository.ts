import { PgBaseRepository } from './base.pg.repository';
import type { IRoleRepository } from '../interfaces';

export class PostgresRoleRepository
  extends PgBaseRepository<any>
  implements IRoleRepository
{
  constructor() {
    super('roles');
  }

  async findByName(name: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM roles WHERE name = $1',
      [name.toUpperCase()],
    );
    return res.rows[0] ?? null;
  }
}

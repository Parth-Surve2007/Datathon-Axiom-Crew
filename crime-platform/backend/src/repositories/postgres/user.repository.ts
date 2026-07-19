import { PgBaseRepository } from './base.pg.repository';
import type { IUserRepository } from '../interfaces';

export class PostgresUserRepository
  extends PgBaseRepository<any>
  implements IUserRepository
{
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()],
    );
    return res.rows[0] ?? null;
  }

  async findByOfficerId(officerId: string): Promise<any | null> {
    const res = await this.pool.query(
      'SELECT * FROM users WHERE officer_id = $1',
      [officerId],
    );
    return res.rows[0] ?? null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id],
    );
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, id],
    );
  }

  // Users use is_active flag instead of deleted_at for soft-delete
  async softDelete(id: string): Promise<boolean> {
    const res = await this.pool.query(
      'UPDATE users SET is_active = FALSE WHERE id = $1 AND is_active = TRUE',
      [id],
    );
    return (res.rowCount ?? 0) > 0;
  }

  async restore(id: string): Promise<any | null> {
    const res = await this.pool.query(
      'UPDATE users SET is_active = TRUE WHERE id = $1 AND is_active = FALSE RETURNING *',
      [id],
    );
    return res.rows[0] ?? null;
  }
}

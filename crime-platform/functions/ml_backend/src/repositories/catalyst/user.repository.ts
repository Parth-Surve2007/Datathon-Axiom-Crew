import { CatalystBaseRepository } from './base.catalyst.repository';
import type { IUserRepository } from '../interfaces';

export class CatalystUserRepository
  extends CatalystBaseRepository<any>
  implements IUserRepository
{
  constructor() { super('users'); }

  async findByEmail(email: string): Promise<any | null> {
    const zcql = this.app.zcql();
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE email = '${email.toLowerCase()}'`,
    );
    return res?.[0] ? this.mapRow(res[0]) : null;
  }

  async findByOfficerId(officerId: string): Promise<any | null> {
    const zcql = this.app.zcql();
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE officer_id = '${officerId}'`,
    );
    return res?.[0] ? this.mapRow(res[0]) : null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.update(id, { last_login: new Date().toISOString() });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.update(id, { password_hash: passwordHash });
  }
}

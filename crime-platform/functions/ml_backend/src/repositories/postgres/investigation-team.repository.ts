import { PgBaseRepository } from './base.pg.repository';
import type { IInvestigationTeamRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class PostgresInvestigationTeamRepository
  extends PgBaseRepository<any>
  implements IInvestigationTeamRepository
{
  constructor() {
    super('investigation_teams');
  }

  async findByFirId(firId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const countRes = await this.pool.query(
      'SELECT COUNT(*) FROM investigation_teams WHERE fir_id = $1 AND deleted_at IS NULL',
      [firId],
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM investigation_teams WHERE fir_id = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [firId, params.limit, offset],
    );

    return { data: res.rows, total };
  }

  async addMember(teamId: string, officerId: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO investigation_team_members (team_id, officer_id, joined_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (team_id, officer_id) DO NOTHING`,
      [teamId, officerId],
    );
  }

  async removeMember(teamId: string, officerId: string): Promise<void> {
    await this.pool.query(
      'DELETE FROM investigation_team_members WHERE team_id = $1 AND officer_id = $2',
      [teamId, officerId],
    );
  }

  async getMembers(teamId: string): Promise<any[]> {
    const res = await this.pool.query(
      `SELECT o.*, itm.joined_at
       FROM investigation_team_members itm
       JOIN officers o ON o.id = itm.officer_id
       WHERE itm.team_id = $1 AND o.deleted_at IS NULL`,
      [teamId],
    );
    return res.rows;
  }
}

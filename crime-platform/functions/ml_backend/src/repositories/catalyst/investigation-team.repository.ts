import { CatalystBaseRepository } from './base.catalyst.repository';
import type { IInvestigationTeamRepository } from '../interfaces';
import type { FindManyResult } from '@app-types/index';
import type { ListParams } from '../interfaces';

export class CatalystInvestigationTeamRepository
  extends CatalystBaseRepository<any>
  implements IInvestigationTeamRepository
{
  constructor() { super('investigation_teams'); }

  async findByFirId(firId: string, params: ListParams): Promise<FindManyResult<any>> {
    const offset = (params.page - 1) * params.limit;
    const zcql = this.app.zcql();
    
    const countRes = await zcql.executeZCQLQuery(
      `SELECT count(ROWID) FROM ${this.tableName} WHERE fir_id = '${firId}' AND deleted_at IS NULL`,
    );
    const total = parseInt(countRes?.[0]?.[this.tableName]?.count ?? '0', 10);
    
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM ${this.tableName} WHERE fir_id = '${firId}' AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ${offset}, ${params.limit}`,
    );
    return { data: (res ?? []).map((r: any) => this.mapRow(r)), total };
  }

  async addMember(teamId: string, officerId: string): Promise<void> {
    const datastore = this.app.datastore();
    const table = datastore.table('investigation_team_members');
    try {
      await table.insertRow({ team_id: teamId, officer_id: officerId, joined_at: new Date().toISOString() });
    } catch (e) {
      // Ignore if exists
    }
  }

  async removeMember(teamId: string, officerId: string): Promise<void> {
    const zcql = this.app.zcql();
    const res = await zcql.executeZCQLQuery(
      `SELECT ROWID FROM investigation_team_members WHERE team_id = '${teamId}' AND officer_id = '${officerId}'`,
    );
    if (res?.[0]) {
      const rowId = res[0].investigation_team_members.ROWID;
      const datastore = this.app.datastore();
      await datastore.table('investigation_team_members').deleteRow(rowId);
    }
  }

  async getMembers(teamId: string): Promise<any[]> {
    const zcql = this.app.zcql();
    // Simplified: Catalyst ZCQL JOINs are limited, doing two queries
    const res = await zcql.executeZCQLQuery(
      `SELECT * FROM investigation_team_members WHERE team_id = '${teamId}'`,
    );
    if (!res || res.length === 0) return [];
    
    const officerIds = res.map((r: any) => `'${r.investigation_team_members.officer_id}'`).join(',');
    const officers = await zcql.executeZCQLQuery(
      `SELECT * FROM officers WHERE ROWID IN (${officerIds}) AND deleted_at IS NULL`,
    );
    
    return (officers ?? []).map((o: any) => {
      const mapped = this.mapRow(o);
      const member = res.find((r: any) => r.investigation_team_members.officer_id === mapped.id);
      mapped.joined_at = member?.investigation_team_members.joined_at;
      return mapped;
    });
  }
}

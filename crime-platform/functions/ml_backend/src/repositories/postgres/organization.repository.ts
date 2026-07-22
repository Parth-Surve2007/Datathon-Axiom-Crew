import { PgBaseRepository } from './base.pg.repository';
import type { IOrganizationRepository } from '../interfaces';

export class PostgresOrganizationRepository
  extends PgBaseRepository<any>
  implements IOrganizationRepository
{
  constructor() {
    super('organizations');
  }
}

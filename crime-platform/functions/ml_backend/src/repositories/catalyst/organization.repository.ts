import { CatalystBaseRepository } from './base.catalyst.repository';
import type { IOrganizationRepository } from '../interfaces';

export class CatalystOrganizationRepository
  extends CatalystBaseRepository<any>
  implements IOrganizationRepository
{
  constructor() { super('organizations'); }
}

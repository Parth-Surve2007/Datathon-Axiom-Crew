import { PgBaseRepository } from './base.pg.repository';
import type { IAddressRepository } from '../interfaces';

export class PostgresAddressRepository
  extends PgBaseRepository<any>
  implements IAddressRepository
{
  constructor() {
    super('addresses');
  }
}

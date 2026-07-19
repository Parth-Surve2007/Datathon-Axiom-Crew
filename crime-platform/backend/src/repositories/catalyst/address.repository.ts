import { CatalystBaseRepository } from './base.catalyst.repository';
import type { IAddressRepository } from '../interfaces';

export class CatalystAddressRepository
  extends CatalystBaseRepository<any>
  implements IAddressRepository
{
  constructor() { super('addresses'); }
}

import { BaseService } from './base.service';
import { repositoryFactory } from '@repositories/factory';
import { NotFoundError, ConflictError } from '@utils/errors';
import { auditLogger } from '@utils/audit';
import type { CreateRoleDto } from '../dtos/role.dto';
import type { QueryRolesDto } from '../dtos/role.dto';
import type { FindManyResult } from '@app-types/index';

export class RoleService extends BaseService {
  private repo = repositoryFactory.getRoleRepository();

  constructor() {
    super('RoleService');
  }

  async list(query: QueryRolesDto): Promise<FindManyResult<any>> {
    if (query.q) {
      return this.repo.search({
        searchColumns: ['name'],
        query: query.q,
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });
    }

    return this.repo.findMany({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  async getById(id: string): Promise<any> {
    const role = await this.repo.findById(id);
    if (!role) throw new NotFoundError('Role');
    return role;
  }

  async create(dto: CreateRoleDto, userId: string | null): Promise<any> {
    const existing = await this.repo.findByName(dto.name);
    if (existing) {
      throw new ConflictError(`Role with name ${dto.name} already exists`);
    }

    const created = await this.repo.create({ name: dto.name.toUpperCase() });

    await auditLogger.logCreate({
      userId,
      tableName: 'roles',
      recordId: created.id,
      newValues: created,
    });

    return created;
  }

  // Deleting and Updating roles is typically restricted or dangerous,
  // but keeping standard interface structure for now.
  async delete(id: string, userId: string | null): Promise<void> {
    const role = await this.getById(id);
    await this.repo.hardDelete?.(id); // Roles are usually hard deleted if allowed

    await auditLogger.logDelete({
      userId,
      tableName: 'roles',
      recordId: id,
      oldValues: role,
    });
  }
}

export const roleService = new RoleService();

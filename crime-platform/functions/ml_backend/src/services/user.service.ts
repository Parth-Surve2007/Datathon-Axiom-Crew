import { BaseService } from './base.service';
import { repositoryFactory } from '@repositories/factory';
import { NotFoundError, ConflictError } from '@utils/errors';
import { auditLogger } from '@utils/audit';
import bcrypt from 'bcryptjs';
import type { CreateUserDto, UpdateUserDto, QueryUsersDto, UserResponse } from '../dtos/user.dto';
import type { FindManyResult } from '@app-types/index';

export class UserService extends BaseService {
  private userRepo = repositoryFactory.getUserRepository();
  private roleRepo = repositoryFactory.getRoleRepository();

  constructor() {
    super('UserService');
  }

  private sanitizeUser(user: any): UserResponse {
    const { password_hash, passwordHash, ...safeUser } = user;
    return safeUser as UserResponse;
  }

  async list(query: QueryUsersDto): Promise<FindManyResult<UserResponse>> {
    const filters: Record<string, unknown> = {};
    if (query.roleId) filters.role_id = query.roleId;
    if (query.officerId) filters.officer_id = query.officerId;
    if (query.isActive !== undefined) filters.is_active = query.isActive;

    let res;
    if (query.q) {
      res = await this.userRepo.search({
        searchColumns: ['email'],
        query: query.q,
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        filters,
      });
    } else {
      res = await this.userRepo.findMany({
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        filters,
      });
    }

    return {
      data: res.data.map(this.sanitizeUser),
      total: res.total,
    };
  }

  async getById(id: string): Promise<UserResponse> {
    const user = await this.userRepo.findByIdIncludeDeleted?.(id) || await this.userRepo.findById(id);
    if (!user) throw new NotFoundError('User');
    return this.sanitizeUser(user);
  }

  async create(dto: CreateUserDto, requestUserId: string | null): Promise<UserResponse> {
    const [existingEmail, roleExists] = await Promise.all([
      this.userRepo.findByEmail(dto.email),
      this.roleRepo.findById(dto.roleId),
    ]);

    if (existingEmail) throw new ConflictError('Email already in use');
    if (!roleExists) throw new NotFoundError('Role');

    if (dto.officerId) {
      const existingOfficer = await this.userRepo.findByOfficerId(dto.officerId);
      if (existingOfficer) throw new ConflictError('Officer already linked to a user');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(dto.password, salt);

    const created = await this.userRepo.create({
      email: dto.email.toLowerCase(),
      password_hash,
      role_id: dto.roleId,
      officer_id: dto.officerId || null,
      is_active: dto.isActive,
    });

    await auditLogger.logCreate({
      userId: requestUserId,
      tableName: 'users',
      recordId: created.id,
      newValues: { email: created.email, role_id: created.role_id }, // Omit hash in audit
    });

    return this.sanitizeUser(created);
  }

  async update(id: string, dto: UpdateUserDto, requestUserId: string | null): Promise<UserResponse> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError('User');

    const updatePayload: Record<string, unknown> = {};
    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findByEmail(dto.email);
      if (existing) throw new ConflictError('Email already in use');
      updatePayload.email = dto.email.toLowerCase();
    }
    if (dto.roleId) updatePayload.role_id = dto.roleId;
    if (dto.officerId) updatePayload.officer_id = dto.officerId;
    if (dto.isActive !== undefined) updatePayload.is_active = dto.isActive;

    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      updatePayload.password_hash = await bcrypt.hash(dto.password, salt);
    }

    const updated = await this.userRepo.update(id, updatePayload);
    if (!updated) throw new NotFoundError('User');

    // Audit log
    const { password_hash, ...safeOld } = user;
    const { password_hash: newHash, ...safeNew } = updated;
    await auditLogger.logUpdate({
      userId: requestUserId,
      tableName: 'users',
      recordId: id,
      oldValues: safeOld,
      newValues: safeNew,
    });

    return this.sanitizeUser(updated);
  }

  async toggleActive(id: string, requestUserId: string | null): Promise<void> {
    const user = await this.userRepo.findByIdIncludeDeleted?.(id) || await this.userRepo.findById(id);
    if (!user) throw new NotFoundError('User');

    if (user.is_active) {
      await this.userRepo.softDelete(id);
      await auditLogger.logStatusChange({
        userId: requestUserId,
        tableName: 'users',
        recordId: id,
        oldStatus: 'ACTIVE',
        newStatus: 'INACTIVE',
      });
    } else {
      await this.userRepo.restore(id);
      await auditLogger.logStatusChange({
        userId: requestUserId,
        tableName: 'users',
        recordId: id,
        oldStatus: 'INACTIVE',
        newStatus: 'ACTIVE',
      });
    }
  }
}

export const userService = new UserService();

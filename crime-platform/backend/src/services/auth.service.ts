import { BaseService } from './base.service';
import { repositoryFactory } from '@repositories/factory';
import { NotFoundError, UnauthorizedError } from '@utils/errors';
import { auditLogger } from '@utils/audit';
import bcrypt from 'bcryptjs';
import { signToken } from '@middleware/auth';
import type { LoginDto, ChangePasswordDto } from '../dtos/auth.dto';
import type { AuthenticatedUser } from '@app-types/index';

export class AuthService extends BaseService {
  private userRepo = repositoryFactory.getUserRepository();
  private roleRepo = repositoryFactory.getRoleRepository();
  private officerRepo = repositoryFactory.getOfficerRepository();
  private stationRepo = repositoryFactory.getPoliceStationRepository();

  constructor() {
    super('AuthService');
  }

  async login(dto: LoginDto): Promise<{ token: string; user: AuthenticatedUser }> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user || !user.is_active) {
      throw new UnauthorizedError('Invalid credentials or account inactive');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Load full user context for token payload
    const role = await this.roleRepo.findById(user.role_id);
    let officer = null;
    if (user.officer_id) {
      officer = await this.officerRepo.findById(user.officer_id);
    }

    const authUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      role: role?.name || 'READONLY',
      badgeId: officer?.badge_id || 'SYS',
      stationId: officer?.station_id || 'HQ',
      name: officer?.name || 'System User',
    };

    const { token } = signToken(authUser);

    // Update last login
    await this.userRepo.updateLastLogin(user.id);
    await auditLogger.log({
      userId: user.id,
      action: 'LOGIN',
      tableName: 'users',
      recordId: user.id,
    });

    return { token, user: authUser };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User');

    const isValid = await bcrypt.compare(dto.currentPassword, user.password_hash);
    if (!isValid) throw new UnauthorizedError('Current password is incorrect');

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(dto.newPassword, salt);

    await this.userRepo.updatePassword(userId, newHash);
  }
}

export const authService = new AuthService();

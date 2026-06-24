import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { RbacService } from '../../rbac/services/rbac.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthRepository } from '../repositories/auth.repository';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly rbacService: RbacService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.authRepository.findUserByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    const passwordHash = await this.passwordService.hashPassword(registerDto.password);
    const user = await this.authRepository.createUser({
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });

    const roleIds = await this.resolveInitialRoleIds(registerDto.roleIds);
    await this.authRepository.assignRoles(user.id, roleIds);

    return this.buildSession(user.id, user.email, user.firstName, user.lastName);
  }

  async login(loginDto: LoginDto) {
    const user = await this.authRepository.findUserByEmail(loginDto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValidPassword = await this.passwordService.verifyPassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.buildSession(user.id, user.email, user.firstName, user.lastName);
  }

  async getCurrentUser(userId: string) {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User does not exist or is inactive.');
    }

    return this.buildCurrentUser(user.id, user.email, user.firstName, user.lastName);
  }

  async refresh(userId: string) {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User does not exist or is inactive.');
    }

    return this.buildSession(user.id, user.email, user.firstName, user.lastName);
  }

  private async buildSession(
    userId: string,
    email: string,
    firstName: string,
    lastName: string,
  ) {
    return {
      user: await this.buildCurrentUser(userId, email, firstName, lastName),
      accessToken: this.tokenService.signToken({
        userId,
        email,
        type: 'access',
      }),
      refreshToken: this.tokenService.signToken({
        userId,
        email,
        type: 'refresh',
      }),
    };
  }

  private async buildCurrentUser(
    userId: string,
    email: string,
    firstName: string,
    lastName: string,
  ) {
    const { permissions } = await this.rbacService.getUserPermissions(userId);

    return {
      id: userId,
      email,
      firstName,
      lastName,
      permissions,
    };
  }

  private async resolveInitialRoleIds(roleIds?: string[]) {
    if (roleIds?.length) {
      return roleIds;
    }

    const userCount = await this.authRepository.countUsers();

    if (userCount > 0) {
      return [];
    }

    const administratorRole = await this.authRepository.findAdministratorRole();
    return administratorRole ? [administratorRole.id] : [];
  }
}

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PermissionKey } from '../../rbac/enums/permission-key.enum';
import { RoleModel } from '../../rbac/models/role.model';
import { UserModel } from '../../rbac/models/user.model';
import { PasswordService } from '../../auth/services/password.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserPasswordDto } from '../dto/update-user-password.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async listUsers() {
    const users = await this.usersRepository.listUsers();
    return users.map((user) => this.serializeUser(user));
  }

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findUserByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    const passwordHash = await this.passwordService.hashPassword(createUserDto.password);
    const user = await this.usersRepository.createUser({
      email: createUserDto.email,
      passwordHash,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
    });

    if (createUserDto.roleIds?.length) {
      const updatedUser = await this.usersRepository.updateUserRoles(
        user.id,
        createUserDto.roleIds,
      );

      if (!updatedUser) {
        throw new NotFoundException('User not found.');
      }

      return this.serializeUser(updatedUser);
    }

    return this.serializeUser(user);
  }

  async updateUserRoles(userId: string, roleIds: string[]) {
    const user = await this.usersRepository.updateUserRoles(userId, roleIds);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.serializeUser(user);
  }

  async updateUserProfile(
    userId: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const currentUser = await this.usersRepository.findUserById(userId);

    if (!currentUser) {
      throw new NotFoundException('User not found.');
    }

    const existingUser = await this.usersRepository.findUserByEmail(
      updateUserProfileDto.email,
    );

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('A user with this email already exists.');
    }

    const user = await this.usersRepository.updateUserProfile(userId, {
      email: updateUserProfileDto.email,
      firstName: updateUserProfileDto.firstName,
      lastName: updateUserProfileDto.lastName,
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.serializeUser(user);
  }

  async updateUserPassword(
    userId: string,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    const passwordHash = await this.passwordService.hashPassword(
      updateUserPasswordDto.password,
    );
    const user = await this.usersRepository.updateUserPassword(userId, passwordHash);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.serializeUser(user);
  }

  async updateUserStatus(
    userId: string,
    updateUserStatusDto: UpdateUserStatusDto,
  ) {
    const user = await this.usersRepository.updateUserStatus(
      userId,
      updateUserStatusDto.isActive,
    );

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.serializeUser(user);
  }

  private serializeUser(user: UserModel) {
    const roles = user.roles ?? [];

    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roleIds: roles.map((role: RoleModel) => role.id),
      roles: roles.map((role: RoleModel) => ({
        id: role.id,
        name: role.name,
      })),
      permissions: [] as PermissionKey[],
    };
  }
}

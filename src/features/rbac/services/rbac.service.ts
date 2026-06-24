import { ConflictException, Injectable } from '@nestjs/common';

import { CreateRoleDto } from '../dto/create-role.dto';
import { PermissionKey } from '../enums/permission-key.enum';
import { UserPermissions } from '../interfaces/user-permissions.interface';
import { RbacRepository } from '../repositories/rbac.repository';

@Injectable()
export class RbacService {
  constructor(private readonly rbacRepository: RbacRepository) {}

  async getUserPermissions(userId: string): Promise<UserPermissions> {
    const permissionKeys = await this.rbacRepository.findUserPermissionKeys(userId);

    return {
      userId,
      permissions: [...new Set(permissionKeys)],
    };
  }

  async userHasPermissions(
    userId: string,
    requiredPermissions: PermissionKey[],
  ): Promise<boolean> {
    const { permissions } = await this.getUserPermissions(userId);
    const permissionSet = new Set(permissions);

    return requiredPermissions.every((permission) => permissionSet.has(permission));
  }

  async listRoles() {
    const roles = await this.rbacRepository.listRoles();

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description ?? '',
      isSystem: role.isSystem,
      permissions: role.permissions?.map((permission) => permission.key) ?? [],
    }));
  }

  async listPermissions() {
    const permissions = await this.rbacRepository.listPermissions();

    return permissions.map((permission) => ({
      key: permission.key,
      label: permission.key,
      group: permission.key.split(':')[0] ?? 'general',
      description: permission.description ?? '',
    }));
  }

  async createRole(createRoleDto: CreateRoleDto) {
    const existingRole = await this.rbacRepository.findRoleByName(createRoleDto.name);

    if (existingRole) {
      throw new ConflictException('A role with this name already exists.');
    }

    const role = await this.rbacRepository.createRole({
      name: createRoleDto.name,
      description: createRoleDto.description,
      permissions: createRoleDto.permissions ?? [],
    });

    return this.serializeRole(role);
  }

  async updateRolePermissions(roleId: string, permissions: PermissionKey[]) {
    const role = await this.rbacRepository.updateRolePermissions(roleId, permissions);

    if (!role) {
      return null;
    }

    return this.serializeRole(role);
  }

  private serializeRole(role: Awaited<ReturnType<RbacRepository['updateRolePermissions']>>) {
    if (!role) {
      return null;
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description ?? '',
      isSystem: role.isSystem,
      permissions: role.permissions?.map((permission) => permission.key) ?? [],
    };
  }
}

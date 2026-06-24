import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes, QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { PermissionKey } from '../enums/permission-key.enum';
import { PermissionModel } from '../models/permission.model';
import { RolePermissionModel } from '../models/role-permission.model';
import { RoleModel } from '../models/role.model';
import { UserModel } from '../models/user.model';

@Injectable()
export class RbacRepository {
  constructor(
    private readonly sequelize: Sequelize,
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    @InjectModel(RoleModel)
    private readonly roleModel: typeof RoleModel,
    @InjectModel(PermissionModel)
    private readonly permissionModel: typeof PermissionModel,
    @InjectModel(RolePermissionModel)
    private readonly rolePermissionModel: typeof RolePermissionModel,
  ) {}

  async findUserPermissionKeys(userId: string): Promise<PermissionKey[]> {
    const rows = await this.sequelize.query<{ key: PermissionKey }>(
      `
        SELECT DISTINCT permissions.key
        FROM users
        JOIN user_roles ON user_roles.user_id = users.id
        JOIN role_permissions ON role_permissions.role_id = user_roles.role_id
        JOIN permissions ON permissions.id = role_permissions.permission_id
        WHERE users.id = :userId
          AND users.is_active = TRUE
        ORDER BY permissions.key
      `,
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      },
    );

    return rows.map((row) => row.key);
  }

  async listRoles() {
    return this.roleModel.findAll({
      include: [
        {
          model: PermissionModel,
          through: {
            attributes: [],
          },
        },
      ],
      order: [['name', 'ASC']],
    });
  }

  async listPermissions() {
    return this.permissionModel.findAll({
      order: [['key', 'ASC']],
    });
  }

  async findRoleByName(name: string) {
    return this.roleModel.findOne({
      where: {
        name,
      },
    });
  }

  async createRole(payload: {
    name: string;
    description?: string;
    permissions: PermissionKey[];
  }) {
    const role = await this.roleModel.create({
      name: payload.name,
      description: payload.description ?? null,
      isSystem: false,
    } as CreationAttributes<RoleModel>);

    if (!payload.permissions.length) {
      return this.findRoleWithPermissions(role.id);
    }

    return this.updateRolePermissions(role.id, payload.permissions);
  }

  async updateRolePermissions(roleId: string, permissionKeys: PermissionKey[]) {
    const permissions = await this.permissionModel.findAll({
      where: {
        key: permissionKeys,
      },
    });

    await this.rolePermissionModel.destroy({
      where: {
        roleId,
      },
    });

    if (permissions.length) {
      await this.rolePermissionModel.bulkCreate(
        permissions.map((permission) => ({
          roleId,
          permissionId: permission.id,
        })) as CreationAttributes<RolePermissionModel>[],
      );
    }

    return this.findRoleWithPermissions(roleId);
  }

  private findRoleWithPermissions(roleId: string) {
    return this.roleModel.findByPk(roleId, {
      include: [
        {
          model: PermissionModel,
          through: {
            attributes: [],
          },
        },
      ],
    });
  }
}

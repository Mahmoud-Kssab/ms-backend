import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes } from 'sequelize';

import { RoleModel } from '../../rbac/models/role.model';
import { UserRoleModel } from '../../rbac/models/user-role.model';
import { UserModel } from '../../rbac/models/user.model';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    @InjectModel(RoleModel)
    private readonly roleModel: typeof RoleModel,
    @InjectModel(UserRoleModel)
    private readonly userRoleModel: typeof UserRoleModel,
  ) {}

  async findUserByEmail(email: string) {
    return this.userModel.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async findUserById(userId: string) {
    return this.userModel.findOne({
      where: {
        id: userId,
        isActive: true,
      },
    });
  }

  async countUsers() {
    return this.userModel.count();
  }

  async findAdministratorRole() {
    return this.roleModel.findOne({
      where: {
        name: 'Administrator',
      },
    });
  }

  async createUser(payload: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }) {
    return this.userModel.create({
      email: payload.email.toLowerCase(),
      passwordHash: payload.passwordHash,
      firstName: payload.firstName,
      lastName: payload.lastName,
      isActive: true,
    } as CreationAttributes<UserModel>);
  }

  async assignRoles(userId: string, roleIds: string[]) {
    await this.userRoleModel.destroy({
      where: {
        userId,
      },
    });

    if (!roleIds.length) {
      return;
    }

    await this.userRoleModel.bulkCreate(
      roleIds.map((roleId) => ({
        userId,
        roleId,
      })) as CreationAttributes<UserRoleModel>[],
    );
  }
}

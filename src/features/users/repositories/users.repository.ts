import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes } from 'sequelize';

import { RoleModel } from '../../rbac/models/role.model';
import { UserRoleModel } from '../../rbac/models/user-role.model';
import { UserModel } from '../../rbac/models/user.model';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    @InjectModel(UserRoleModel)
    private readonly userRoleModel: typeof UserRoleModel,
  ) {}

  async listUsers() {
    return this.userModel.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'isActive'],
      include: [
        {
          model: RoleModel,
          attributes: ['id', 'name'],
          through: {
            attributes: [],
          },
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async findUserByEmail(email: string) {
    return this.userModel.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async findUserById(userId: string) {
    return this.findUserWithRoles(userId);
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

  async updateUserRoles(userId: string, roleIds: string[]) {
    await this.userRoleModel.destroy({
      where: {
        userId,
      },
    });

    if (roleIds.length) {
      await this.userRoleModel.bulkCreate(
        roleIds.map((roleId) => ({
          userId,
          roleId,
        })) as CreationAttributes<UserRoleModel>[],
      );
    }

    return this.findUserWithRoles(userId);
  }

  async updateUserProfile(
    userId: string,
    payload: {
      email: string;
      firstName: string;
      lastName: string;
    },
  ) {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      return null;
    }

    await user.update({
      email: payload.email.toLowerCase(),
      firstName: payload.firstName,
      lastName: payload.lastName,
    });

    return this.findUserWithRoles(userId);
  }

  async updateUserPassword(userId: string, passwordHash: string) {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      return null;
    }

    await user.update({
      passwordHash,
    });

    return this.findUserWithRoles(userId);
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      return null;
    }

    await user.update({
      isActive,
    });

    return this.findUserWithRoles(userId);
  }

  private findUserWithRoles(userId: string) {
    return this.userModel.findByPk(userId, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'isActive'],
      include: [
        {
          model: RoleModel,
          attributes: ['id', 'name'],
          through: {
            attributes: [],
          },
        },
      ],
    });
  }
}

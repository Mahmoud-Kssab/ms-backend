import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

import { PermissionModel } from './permission.model';
import { RolePermissionModel } from './role-permission.model';
import { UserRoleModel } from './user-role.model';
import { UserModel } from './user.model';

@Table({
  tableName: 'roles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class RoleModel extends Model<RoleModel> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: 'is_system',
  })
  isSystem!: boolean;

  @BelongsToMany(() => UserModel, () => UserRoleModel)
  users?: UserModel[];

  @BelongsToMany(() => PermissionModel, () => RolePermissionModel)
  permissions?: PermissionModel[];
}

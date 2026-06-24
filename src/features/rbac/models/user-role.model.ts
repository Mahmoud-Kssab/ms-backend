import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { RoleModel } from './role.model';
import { UserModel } from './user.model';

@Table({
  tableName: 'user_roles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class UserRoleModel extends Model<UserRoleModel> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;

  @ForeignKey(() => RoleModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'role_id',
  })
  roleId!: string;
}

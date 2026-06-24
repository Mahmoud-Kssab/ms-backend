import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { PermissionModel } from './permission.model';
import { RoleModel } from './role.model';

@Table({
  tableName: 'role_permissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class RolePermissionModel extends Model<RolePermissionModel> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => RoleModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'role_id',
  })
  roleId!: string;

  @ForeignKey(() => PermissionModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'permission_id',
  })
  permissionId!: string;
}

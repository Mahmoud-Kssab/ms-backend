import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

import { PermissionKey } from '../enums/permission-key.enum';
import { RolePermissionModel } from './role-permission.model';
import { RoleModel } from './role.model';

@Table({
  tableName: 'permissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class PermissionModel extends Model<PermissionModel> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.STRING(120),
    allowNull: false,
    unique: true,
  })
  key!: PermissionKey;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @BelongsToMany(() => RoleModel, () => RolePermissionModel)
  roles?: RoleModel[];
}

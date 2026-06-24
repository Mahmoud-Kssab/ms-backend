import { Column, DataType, Model, Table } from 'sequelize-typescript';

import { ChannelProvider } from '../enums/channel-provider.enum';

@Table({
  tableName: 'channels',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class ChannelModel extends Model<ChannelModel> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.STRING(40),
    allowNull: false,
  })
  provider!: ChannelProvider;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'external_id',
  })
  externalId!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  credentials!: Record<string, unknown>;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  profile!: Record<string, unknown>;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: 'is_active',
  })
  isActive!: boolean;
}

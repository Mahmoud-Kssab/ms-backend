import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';

import { ChannelModel } from '../../channels/models/channel.model';
import { MessageModel } from './message.model';

@Table({
  tableName: 'conversations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class ConversationModel extends Model<ConversationModel> {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  id!: string;

  @ForeignKey(() => ChannelModel)
  @Column({ type: DataType.UUID, allowNull: false, field: 'channel_id' })
  channelId!: string;

  @Column({ type: DataType.STRING(255), allowNull: false, field: 'external_id' })
  externalId!: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  customer!: Record<string, unknown>;

  @Column({ type: DataType.JSONB, allowNull: false })
  metadata!: Record<string, unknown>;

  @Column({ type: DataType.STRING(30), allowNull: false })
  status!: 'OPEN' | 'PENDING' | 'RESOLVED';

  @Column({ type: DataType.DATE, allowNull: true, field: 'last_message_at' })
  lastMessageAt!: Date | null;

  @BelongsTo(() => ChannelModel)
  channel?: ChannelModel;

  @HasMany(() => MessageModel)
  messages?: MessageModel[];
}

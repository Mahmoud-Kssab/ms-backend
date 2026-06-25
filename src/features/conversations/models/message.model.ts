import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { UserModel } from '../../rbac/models/user.model';
import { MessageDirection } from '../enums/message-direction.enum';
import { ConversationModel } from './conversation.model';

@Table({
  tableName: 'messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class MessageModel extends Model<MessageModel> {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  id!: string;

  @ForeignKey(() => ConversationModel)
  @Column({ type: DataType.UUID, allowNull: false, field: 'conversation_id' })
  conversationId!: string;

  @Column({ type: DataType.STRING(255), allowNull: true, field: 'external_id' })
  externalId!: string | null;

  @Column({ type: DataType.STRING(20), allowNull: false })
  direction!: MessageDirection;

  @Column({ type: DataType.TEXT, allowNull: false })
  body!: string;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: true, field: 'author_user_id' })
  authorUserId!: string | null;

  @Column({ type: DataType.JSONB, allowNull: false, field: 'provider_payload' })
  providerPayload!: Record<string, unknown>;

  @BelongsTo(() => ConversationModel)
  conversation?: ConversationModel;

  @BelongsTo(() => UserModel)
  author?: UserModel;
}

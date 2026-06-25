import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes } from 'sequelize';

import { ChannelModel } from '../../channels/models/channel.model';
import { MessageDirection } from '../enums/message-direction.enum';
import { ConversationModel } from '../models/conversation.model';
import { MessageModel } from '../models/message.model';

@Injectable()
export class ConversationsRepository {
  constructor(
    @InjectModel(ConversationModel)
    private readonly conversationModel: typeof ConversationModel,
    @InjectModel(MessageModel)
    private readonly messageModel: typeof MessageModel,
  ) {}

  async listConversations(channelId?: string) {
    return this.conversationModel.findAll({
      where: channelId ? { channelId } : undefined,
      include: [
        {
          model: ChannelModel,
          attributes: ['id', 'provider', 'name', 'isActive'],
        },
      ],
      order: [['last_message_at', 'DESC NULLS LAST'], ['created_at', 'DESC']],
    });
  }

  async findConversationById(conversationId: string) {
    return this.conversationModel.findByPk(conversationId, {
      include: [
        {
          model: ChannelModel,
          attributes: ['id', 'provider', 'name', 'isActive', 'credentials'],
        },
      ],
    });
  }

  async listMessages(conversationId: string) {
    return this.messageModel.findAll({
      where: { conversationId },
      order: [['created_at', 'ASC']],
    });
  }

  async createMessage(payload: {
    conversationId: string;
    externalId: string | null;
    direction: MessageDirection;
    body: string;
    authorUserId: string;
    providerPayload: Record<string, unknown>;
  }) {
    return this.messageModel.create(payload as CreationAttributes<MessageModel>);
  }

  async touchLastCustomerMessage(conversation: ConversationModel) {
    return conversation.update({ lastMessageAt: new Date() });
  }
}

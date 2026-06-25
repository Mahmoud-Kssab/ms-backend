import { Injectable, NotFoundException } from '@nestjs/common';

import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { AppEventsGateway } from '../../realtime/gateways/app-events.gateway';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MessageDirection } from '../enums/message-direction.enum';
import { ConversationModel } from '../models/conversation.model';
import { ConversationsRepository } from '../repositories/conversations.repository';
import { OutboundMessageRouterService } from '../routing/outbound-message-router.service';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly outboundMessageRouter: OutboundMessageRouterService,
    private readonly appEventsGateway: AppEventsGateway,
  ) {}

  async listConversations(channelId?: string) {
    return this.conversationsRepository.listConversations(channelId);
  }

  async listMessages(conversationId: string) {
    await this.getConversation(conversationId);
    return this.conversationsRepository.listMessages(conversationId);
  }

  async createMessage(
    conversationId: string,
    createMessageDto: CreateMessageDto,
    author: AuthenticatedUser,
  ) {
    const conversation = await this.getConversation(conversationId);

    if (createMessageDto.direction === MessageDirection.Internal) {
      const message = await this.conversationsRepository.createMessage({
        conversationId: conversation.id,
        externalId: null,
        direction: MessageDirection.Internal,
        body: createMessageDto.body.trim(),
        authorUserId: author.id,
        providerPayload: {},
      });

      this.appEventsGateway.publishConversationMessage(conversation.id, message);
      return message;
    }

    if (createMessageDto.direction !== MessageDirection.Outbound) {
      throw new NotFoundException('Only OUTBOUND and INTERNAL messages can be created here.');
    }

    if (!conversation.channel) {
      throw new NotFoundException('Conversation channel was not found.');
    }

    const delivery = await this.outboundMessageRouter.send({
      channel: conversation.channel,
      conversation,
      body: createMessageDto.body.trim(),
    });
    const message = await this.conversationsRepository.createMessage({
      conversationId: conversation.id,
      externalId: delivery.externalId,
      direction: MessageDirection.Outbound,
      body: createMessageDto.body.trim(),
      authorUserId: author.id,
      providerPayload: delivery.providerPayload,
    });

    await this.conversationsRepository.touchLastCustomerMessage(conversation);
    this.appEventsGateway.publishConversationMessage(conversation.id, message);
    return message;
  }

  private async getConversation(conversationId: string): Promise<ConversationModel> {
    const conversation = await this.conversationsRepository.findConversationById(
      conversationId,
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found.');
    }

    return conversation;
  }
}

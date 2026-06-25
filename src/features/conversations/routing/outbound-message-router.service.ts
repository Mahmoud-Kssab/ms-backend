import { BadRequestException, Injectable, NotImplementedException } from '@nestjs/common';

import { ChannelProvider } from '../../channels/enums/channel-provider.enum';
import { ChannelModel } from '../../channels/models/channel.model';
import { ConversationModel } from '../models/conversation.model';
import { OutboundDeliveryResult } from './outbound-message-provider.interface';
import { TelegramOutboundMessageProvider } from './telegram-outbound-message.provider';
import { WhatsAppOutboundMessageProvider } from './whatsapp-outbound-message.provider';

@Injectable()
export class OutboundMessageRouterService {
  constructor(
    private readonly whatsAppProvider: WhatsAppOutboundMessageProvider,
    private readonly telegramProvider: TelegramOutboundMessageProvider,
  ) {}

  async send(input: {
    channel: ChannelModel;
    conversation: ConversationModel;
    body: string;
  }): Promise<OutboundDeliveryResult> {
    switch (input.channel.provider) {
      case ChannelProvider.WhatsApp:
        return this.whatsAppProvider.send(input);
      case ChannelProvider.Telegram:
        return this.telegramProvider.send(input);
      case ChannelProvider.Messenger:
      case ChannelProvider.Instagram:
        throw new NotImplementedException(
          `Outbound ${input.channel.provider} messaging is not configured yet.`,
        );
      default:
        throw new BadRequestException('Unsupported channel provider.');
    }
  }
}

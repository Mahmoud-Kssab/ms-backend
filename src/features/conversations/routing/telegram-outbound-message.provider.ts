import { BadRequestException, Injectable } from '@nestjs/common';

import { ChannelCredentialsService } from '../../channels/services/channel-credentials.service';
import { OutboundMessageProvider } from './outbound-message-provider.interface';

@Injectable()
export class TelegramOutboundMessageProvider implements OutboundMessageProvider {
  constructor(private readonly credentialsService: ChannelCredentialsService) {}

  async send({ channel, conversation, body }: Parameters<OutboundMessageProvider['send']>[0]) {
    const credentials = this.credentialsService.decryptCredentials(channel.credentials);
    const botToken = this.requiredValue(credentials, 'bot_token');
    const chatId = this.requiredValue(conversation.customer, 'external_id');
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: body }),
    });
    const payload = await this.readPayload(response);

    if (!response.ok || payload.ok !== true) {
      throw new BadRequestException(
        typeof payload.description === 'string'
          ? payload.description
          : 'Telegram delivery failed.',
      );
    }

    const result = payload.result;
    const externalId =
      typeof result === 'object' && result !== null && 'message_id' in result
        ? String(result.message_id)
        : null;

    return { externalId, providerPayload: payload };
  }

  private requiredValue(values: Record<string, unknown>, key: string) {
    const value = values[key];

    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`Telegram requires ${key} to send this message.`);
    }

    return value.trim();
  }

  private async readPayload(response: Response) {
    try {
      return (await response.json()) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
}

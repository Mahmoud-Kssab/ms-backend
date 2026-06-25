import { BadRequestException, Injectable } from '@nestjs/common';

import { ChannelCredentialsService } from '../../channels/services/channel-credentials.service';
import { OutboundMessageProvider } from './outbound-message-provider.interface';

@Injectable()
export class WhatsAppOutboundMessageProvider implements OutboundMessageProvider {
  constructor(private readonly credentialsService: ChannelCredentialsService) {}

  async send({ channel, conversation, body }: Parameters<OutboundMessageProvider['send']>[0]) {
    const credentials = this.credentialsService.decryptCredentials(channel.credentials);
    const phoneNumberId = this.requiredCredential(credentials, 'phone_number_id');
    const accessToken = this.requiredCredential(credentials, 'access_token');
    const recipientId = this.recipientId(conversation.customer);
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${encodeURIComponent(phoneNumberId)}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipientId,
          type: 'text',
          text: { body },
        }),
      },
    );
    const payload = await this.readPayload(response);

    if (!response.ok) {
      throw new BadRequestException(this.errorMessage(payload, 'WhatsApp delivery failed.'));
    }

    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    const firstMessage = messages[0];
    const externalId =
      typeof firstMessage === 'object' && firstMessage !== null && 'id' in firstMessage
        ? String(firstMessage.id)
        : null;

    return { externalId, providerPayload: payload };
  }

  private recipientId(customer: Record<string, unknown>) {
    return this.requiredCredential(customer, 'external_id');
  }

  private requiredCredential(values: Record<string, unknown>, key: string) {
    const value = values[key];

    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`WhatsApp requires ${key} to send this message.`);
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

  private errorMessage(payload: Record<string, unknown>, fallback: string) {
    const error = payload.error;
    return typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
      ? error.message
      : fallback;
  }
}

import { ChannelModel } from '../../channels/models/channel.model';
import { ConversationModel } from '../models/conversation.model';

export interface OutboundDeliveryResult {
  externalId: string | null;
  providerPayload: Record<string, unknown>;
}

export interface OutboundMessageProvider {
  send(input: {
    channel: ChannelModel;
    conversation: ConversationModel;
    body: string;
  }): Promise<OutboundDeliveryResult>;
}

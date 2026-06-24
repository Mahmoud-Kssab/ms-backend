import { Module } from '@nestjs/common';

import { WhatsAppWebhookController } from './controllers/whatsapp-webhook.controller';
import { WhatsAppWebhookService } from './services/whatsapp-webhook.service';

@Module({
  controllers: [WhatsAppWebhookController],
  providers: [WhatsAppWebhookService],
})
export class WebhooksModule {}

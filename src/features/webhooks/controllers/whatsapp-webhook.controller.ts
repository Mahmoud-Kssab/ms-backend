import {
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { WhatsAppWebhookService } from '../services/whatsapp-webhook.service';

interface WhatsAppWebhookRequest {
  body: unknown;
  rawBody?: Buffer;
}

@Controller('api/v1/webhooks/whatsapp')
export class WhatsAppWebhookController {
  constructor(private readonly whatsAppWebhookService: WhatsAppWebhookService) {}

  @Get()
  verifySubscription(
    @Query('hub.mode') mode: string | undefined,
    @Query('hub.verify_token') verifyToken: string | undefined,
    @Query('hub.challenge') challenge: string | undefined,
  ) {
    if (!this.whatsAppWebhookService.isValidVerification(mode, verifyToken)) {
      throw new ForbiddenException('WhatsApp webhook verification failed.');
    }

    return challenge;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  receiveEvent(
    @Req() request: WhatsAppWebhookRequest,
    @Headers('x-hub-signature-256') signature: string | undefined,
  ) {
    this.whatsAppWebhookService.assertValidSignature(request.rawBody, signature);
    this.whatsAppWebhookService.recordEvent(request.body);

    return { received: true };
  }
}

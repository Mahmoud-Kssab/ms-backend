import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class WhatsAppWebhookService {
  private readonly logger = new Logger(WhatsAppWebhookService.name);

  constructor(private readonly configService: ConfigService) {}

  isValidVerification(mode: string | undefined, verifyToken: string | undefined) {
    const expectedToken = this.configService.get<string>('app.whatsappVerifyToken');

    if (!expectedToken) {
      throw new ServiceUnavailableException(
        'WhatsApp webhook verification is not configured.',
      );
    }

    return mode === 'subscribe' && this.safeEqual(verifyToken, expectedToken);
  }

  assertValidSignature(rawBody: Buffer | undefined, signature: string | undefined) {
    const appSecret = this.configService.get<string>('app.whatsappAppSecret');

    if (!appSecret) {
      throw new ServiceUnavailableException(
        'WhatsApp webhook signature validation is not configured.',
      );
    }

    if (!rawBody || !signature) {
      throw new UnauthorizedException('Missing WhatsApp webhook signature.');
    }

    const expectedSignature = `sha256=${createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex')}`;

    if (!this.safeEqual(signature, expectedSignature)) {
      throw new UnauthorizedException('Invalid WhatsApp webhook signature.');
    }
  }

  recordEvent(payload: unknown) {
    const entries = this.getEntryCount(payload);
    this.logger.log(`Accepted WhatsApp webhook event with ${entries} entr${entries === 1 ? 'y' : 'ies'}.`);
  }

  private safeEqual(value: string | undefined, expectedValue: string) {
    if (!value) {
      return false;
    }

    const valueBuffer = Buffer.from(value);
    const expectedBuffer = Buffer.from(expectedValue);
    return (
      valueBuffer.length === expectedBuffer.length &&
      timingSafeEqual(valueBuffer, expectedBuffer)
    );
  }

  private getEntryCount(payload: unknown) {
    if (!payload || typeof payload !== 'object' || !('entry' in payload)) {
      return 0;
    }

    const entries = (payload as { entry?: unknown }).entry;
    return Array.isArray(entries) ? entries.length : 0;
  }
}

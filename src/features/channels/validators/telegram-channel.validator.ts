import { BadRequestException, Injectable } from '@nestjs/common';

import { ChannelProvider } from '../enums/channel-provider.enum';
import {
  BaseChannelValidator,
  ValidatedChannelProfile,
} from '../interfaces/channel-validator.interface';
import { getRequiredString, readJsonResponse } from './validator-utils';

@Injectable()
export class TelegramChannelValidator implements BaseChannelValidator {
  readonly provider = ChannelProvider.Telegram;

  async validate(
    credentials: Record<string, unknown>,
  ): Promise<ValidatedChannelProfile> {
    const botToken = getRequiredString(credentials, 'bot_token', 'Telegram');
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const payload = await readJsonResponse(response);

    if (!response.ok || payload.ok !== true) {
      throw new BadRequestException(this.resolveTelegramError(payload));
    }

    const result = payload.result;

    if (typeof result !== 'object' || result === null || !('id' in result)) {
      throw new BadRequestException('Telegram returned an invalid bot profile.');
    }

    const id = result.id;
    const username = 'username' in result ? result.username : undefined;
    const firstName = 'first_name' in result ? result.first_name : undefined;

    return {
      externalId: String(id),
      name:
        typeof username === 'string'
          ? `@${username}`
          : typeof firstName === 'string'
            ? firstName
            : `Telegram ${id}`,
      profile: result as Record<string, unknown>,
    };
  }

  private resolveTelegramError(payload: Record<string, unknown>) {
    const description = payload.description;
    return typeof description === 'string'
      ? description
      : 'Telegram token validation failed.';
  }
}

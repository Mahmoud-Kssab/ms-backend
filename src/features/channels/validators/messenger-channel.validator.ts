import { BadRequestException, Injectable } from '@nestjs/common';

import { ChannelProvider } from '../enums/channel-provider.enum';
import {
  BaseChannelValidator,
  ValidatedChannelProfile,
} from '../interfaces/channel-validator.interface';
import {
  getRequiredString,
  graphErrorMessage,
  readJsonResponse,
} from './validator-utils';

@Injectable()
export class MessengerChannelValidator implements BaseChannelValidator {
  readonly provider = ChannelProvider.Messenger;

  async validate(
    credentials: Record<string, unknown>,
  ): Promise<ValidatedChannelProfile> {
    const pageId = getRequiredString(credentials, 'page_id', 'Messenger');
    const pageAccessToken = getRequiredString(
      credentials,
      'page_access_token',
      'Messenger',
    );
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${pageId}?fields=id,name&access_token=${pageAccessToken}`,
    );
    const payload = await readJsonResponse(response);

    if (!response.ok) {
      throw new BadRequestException(graphErrorMessage(payload));
    }

    if (String(payload.id) !== pageId) {
      throw new BadRequestException('Messenger Page ID does not match token profile.');
    }

    return {
      externalId: String(payload.id),
      name: typeof payload.name === 'string' ? payload.name : `Messenger ${pageId}`,
      profile: payload,
    };
  }
}

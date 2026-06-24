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
export class InstagramChannelValidator implements BaseChannelValidator {
  readonly provider = ChannelProvider.Instagram;

  async validate(
    credentials: Record<string, unknown>,
  ): Promise<ValidatedChannelProfile> {
    const accountId = getRequiredString(
      credentials,
      'instagram_business_account_id',
      'Instagram',
    );
    const accessToken = getRequiredString(credentials, 'access_token', 'Instagram');
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${accountId}?fields=id,username,name&access_token=${accessToken}`,
    );
    const payload = await readJsonResponse(response);

    if (!response.ok) {
      throw new BadRequestException(graphErrorMessage(payload));
    }

    if (String(payload.id) !== accountId) {
      throw new BadRequestException(
        'Instagram Business Account ID does not match token profile.',
      );
    }

    return {
      externalId: String(payload.id),
      name:
        typeof payload.username === 'string'
          ? `@${payload.username}`
          : typeof payload.name === 'string'
            ? payload.name
            : `Instagram ${accountId}`,
      profile: payload,
    };
  }
}

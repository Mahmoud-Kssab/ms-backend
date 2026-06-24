import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

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
export class WhatsAppChannelValidator implements BaseChannelValidator {
  readonly provider = ChannelProvider.WhatsApp;

  constructor(private readonly configService: ConfigService) {}

  async validate(
    credentials: Record<string, unknown>,
  ): Promise<ValidatedChannelProfile> {
    const phoneNumberId = getRequiredString(
      credentials,
      'phone_number_id',
      'WhatsApp',
    );
    const wabaId = getRequiredString(credentials, 'waba_id', 'WhatsApp');
    const accessToken = getRequiredString(credentials, 'access_token', 'WhatsApp');
    const fields = 'id,display_phone_number,verified_name';
    const response = await fetch(
      this.graphUrl(phoneNumberId, { fields }, accessToken),
      { headers: this.authorizationHeaders(accessToken) },
    );
    const payload = await readJsonResponse(response);

    if (!response.ok) {
      throw new BadRequestException(graphErrorMessage(payload));
    }

    const wabaPhoneNumbers = await this.getWabaPhoneNumbers(wabaId, accessToken);

    if (!wabaPhoneNumbers.includes(String(payload.id ?? phoneNumberId))) {
      throw new BadRequestException(
        'WhatsApp Phone Number ID does not belong to the supplied WABA ID.',
      );
    }

    const displayPhoneNumber = payload.display_phone_number;
    const verifiedName = payload.verified_name;

    return {
      externalId: String(payload.id ?? phoneNumberId),
      name:
        typeof verifiedName === 'string'
          ? verifiedName
          : typeof displayPhoneNumber === 'string'
            ? displayPhoneNumber
            : `WhatsApp ${phoneNumberId}`,
      profile: payload,
    };
  }

  private async getWabaPhoneNumbers(wabaId: string, accessToken: string) {
    const fields = 'id';
    const response = await fetch(
      this.graphUrl(`${wabaId}/phone_numbers`, { fields, limit: '100' }, accessToken),
      { headers: this.authorizationHeaders(accessToken) },
    );
    const payload = await readJsonResponse(response);

    if (!response.ok) {
      throw new BadRequestException(graphErrorMessage(payload));
    }

    const data = payload.data;

    if (!Array.isArray(data)) {
      return [];
    }

    return data.flatMap((phoneNumber) => {
      if (
        typeof phoneNumber === 'object' &&
        phoneNumber !== null &&
        'id' in phoneNumber
      ) {
        return [String(phoneNumber.id)];
      }

      return [];
    });
  }

  private authorizationHeaders(accessToken: string) {
    return { Authorization: `Bearer ${accessToken}` };
  }

  private graphUrl(
    path: string,
    parameters: Record<string, string>,
    accessToken: string,
  ) {
    const query = new URLSearchParams(parameters);
    const appSecret = this.configService.get<string>('app.whatsappAppSecret');

    if (appSecret) {
      query.set(
        'appsecret_proof',
        createHmac('sha256', appSecret).update(accessToken).digest('hex'),
      );
    }

    return `https://graph.facebook.com/v20.0/${encodeURI(path)}?${query.toString()}`;
  }
}

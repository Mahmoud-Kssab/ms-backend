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
export class WhatsAppChannelValidator implements BaseChannelValidator {
  readonly provider = ChannelProvider.WhatsApp;

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
    const fields =
      'id,display_phone_number,verified_name,whatsapp_business_account';
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${phoneNumberId}?fields=${fields}&access_token=${accessToken}`,
    );
    const payload = await readJsonResponse(response);

    if (!response.ok) {
      throw new BadRequestException(graphErrorMessage(payload));
    }

    const linkedWabaId = this.resolveLinkedWabaId(payload);

    if (linkedWabaId && linkedWabaId !== wabaId) {
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

  private resolveLinkedWabaId(payload: Record<string, unknown>) {
    const account = payload.whatsapp_business_account;

    if (typeof account === 'object' && account !== null && 'id' in account) {
      const id = account.id;
      return typeof id === 'string' ? id : String(id);
    }

    return null;
  }
}

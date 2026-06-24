import { BadRequestException, Injectable } from '@nestjs/common';

import { ChannelProvider } from '../enums/channel-provider.enum';
import { BaseChannelValidator } from '../interfaces/channel-validator.interface';
import { InstagramChannelValidator } from './instagram-channel.validator';
import { MessengerChannelValidator } from './messenger-channel.validator';
import { TelegramChannelValidator } from './telegram-channel.validator';
import { WhatsAppChannelValidator } from './whatsapp-channel.validator';

@Injectable()
export class ChannelValidatorFactory {
  private readonly validators: Map<ChannelProvider, BaseChannelValidator>;

  constructor(
    whatsAppValidator: WhatsAppChannelValidator,
    telegramValidator: TelegramChannelValidator,
    messengerValidator: MessengerChannelValidator,
    instagramValidator: InstagramChannelValidator,
  ) {
    this.validators = new Map(
      [
        whatsAppValidator,
        telegramValidator,
        messengerValidator,
        instagramValidator,
      ].map((validator) => [validator.provider, validator]),
    );
  }

  resolve(provider: ChannelProvider) {
    const validator = this.validators.get(provider);

    if (!validator) {
      throw new BadRequestException(`Unsupported channel provider: ${provider}.`);
    }

    return validator;
  }
}

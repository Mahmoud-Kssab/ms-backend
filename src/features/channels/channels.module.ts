import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { ChannelsController } from './controllers/channels.controller';
import { ChannelModel } from './models/channel.model';
import { ChannelsRepository } from './repositories/channels.repository';
import { ChannelCredentialsService } from './services/channel-credentials.service';
import { ChannelsService } from './services/channels.service';
import { ChannelValidatorFactory } from './validators/channel-validator.factory';
import { InstagramChannelValidator } from './validators/instagram-channel.validator';
import { MessengerChannelValidator } from './validators/messenger-channel.validator';
import { TelegramChannelValidator } from './validators/telegram-channel.validator';
import { WhatsAppChannelValidator } from './validators/whatsapp-channel.validator';

@Module({
  imports: [SequelizeModule.forFeature([ChannelModel]), AuthModule, RbacModule],
  controllers: [ChannelsController],
  providers: [
    ChannelsRepository,
    ChannelsService,
    ChannelCredentialsService,
    ChannelValidatorFactory,
    WhatsAppChannelValidator,
    TelegramChannelValidator,
    MessengerChannelValidator,
    InstagramChannelValidator,
  ],
  exports: [ChannelCredentialsService],
})
export class ChannelsModule {}

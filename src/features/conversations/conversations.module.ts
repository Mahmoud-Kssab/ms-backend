import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from '../auth/auth.module';
import { ChannelsModule } from '../channels/channels.module';
import { RbacModule } from '../rbac/rbac.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { ConversationsController } from './controllers/conversations.controller';
import { ConversationModel } from './models/conversation.model';
import { MessageModel } from './models/message.model';
import { ConversationsRepository } from './repositories/conversations.repository';
import { OutboundMessageRouterService } from './routing/outbound-message-router.service';
import { TelegramOutboundMessageProvider } from './routing/telegram-outbound-message.provider';
import { WhatsAppOutboundMessageProvider } from './routing/whatsapp-outbound-message.provider';
import { ConversationsService } from './services/conversations.service';

@Module({
  imports: [
    SequelizeModule.forFeature([ConversationModel, MessageModel]),
    AuthModule,
    ChannelsModule,
    RbacModule,
    RealtimeModule,
  ],
  controllers: [ConversationsController],
  providers: [
    ConversationsRepository,
    ConversationsService,
    OutboundMessageRouterService,
    WhatsAppOutboundMessageProvider,
    TelegramOutboundMessageProvider,
  ],
})
export class ConversationsModule {}

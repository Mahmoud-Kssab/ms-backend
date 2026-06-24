import { Module } from '@nestjs/common';

import { AppEventsGateway } from './gateways/app-events.gateway';
import { RealtimeRoomService } from './services/realtime-room.service';

@Module({
  providers: [AppEventsGateway, RealtimeRoomService],
  exports: [RealtimeRoomService],
})
export class RealtimeModule {}

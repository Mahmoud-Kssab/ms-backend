import { Injectable } from '@nestjs/common';

@Injectable()
export class RealtimeRoomService {
  getGlobalRoom() {
    return 'app:global';
  }

  getUserRoom(userId: string) {
    return `user:${userId}`;
  }
}

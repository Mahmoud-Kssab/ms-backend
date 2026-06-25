import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';

import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { Permissions } from '../../rbac/decorators/permissions.decorator';
import { PermissionKey } from '../../rbac/enums/permission-key.enum';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { CreateMessageDto } from '../dto/create-message.dto';
import { ConversationsService } from '../services/conversations.service';

@Controller('api/v1/conversations')
@UseGuards(AuthGuard, PermissionsGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  @Permissions(PermissionKey.ChatRead)
  listConversations(@Query('channelId') channelId?: string) {
    return this.conversationsService.listConversations(channelId);
  }

  @Get(':id/messages')
  @Permissions(PermissionKey.ChatRead)
  listMessages(@Param('id') conversationId: string) {
    return this.conversationsService.listMessages(conversationId);
  }

  @Post(':id/messages')
  @Permissions(PermissionKey.ChatWrite)
  createMessage(
    @Param('id') conversationId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Req() request: { user: AuthenticatedUser },
  ) {
    return this.conversationsService.createMessage(
      conversationId,
      createMessageDto,
      request.user,
    );
  }
}

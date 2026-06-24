import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../../auth/guards/auth.guard';
import { Permissions } from '../../rbac/decorators/permissions.decorator';
import { PermissionKey } from '../../rbac/enums/permission-key.enum';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { TestChannelConnectionDto } from '../dto/test-channel-connection.dto';
import { UpdateChannelDto } from '../dto/update-channel.dto';
import { ChannelsService } from '../services/channels.service';

@Controller('api/v1/channels')
@UseGuards(AuthGuard, PermissionsGuard)
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  @Permissions(PermissionKey.ChannelRead)
  listChannels() {
    return this.channelsService.listChannels();
  }

  @Post()
  @Permissions(PermissionKey.ChannelManage)
  createChannel(@Body() createChannelDto: CreateChannelDto) {
    return this.channelsService.createChannel(createChannelDto);
  }

  @Patch(':id')
  @Permissions(PermissionKey.ChannelManage)
  updateChannel(
    @Param('id') channelId: string,
    @Body() updateChannelDto: UpdateChannelDto,
  ) {
    return this.channelsService.updateChannel(channelId, updateChannelDto);
  }

  @Post('test-connection')
  @Permissions(PermissionKey.ChannelManage)
  testConnection(@Body() testChannelConnectionDto: TestChannelConnectionDto) {
    return this.channelsService.testConnection(testChannelConnectionDto);
  }
}

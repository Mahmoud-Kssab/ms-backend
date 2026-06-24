import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateChannelDto } from '../dto/create-channel.dto';
import { TestChannelConnectionDto } from '../dto/test-channel-connection.dto';
import { UpdateChannelDto } from '../dto/update-channel.dto';
import { ChannelModel } from '../models/channel.model';
import { ChannelsRepository } from '../repositories/channels.repository';
import { ChannelValidatorFactory } from '../validators/channel-validator.factory';
import { ChannelCredentialsService } from './channel-credentials.service';

@Injectable()
export class ChannelsService {
  constructor(
    private readonly channelsRepository: ChannelsRepository,
    private readonly validatorFactory: ChannelValidatorFactory,
    private readonly channelCredentialsService: ChannelCredentialsService,
  ) {}

  async listChannels() {
    const channels = await this.channelsRepository.listActiveChannels();
    return channels.map((channel) => this.serializeChannel(channel));
  }

  async testConnection(testChannelConnectionDto: TestChannelConnectionDto) {
    const validator = this.validatorFactory.resolve(testChannelConnectionDto.provider);
    const profile = await validator.validate(testChannelConnectionDto.credentials);

    return {
      provider: testChannelConnectionDto.provider,
      externalId: profile.externalId,
      name: profile.name,
      profile: profile.profile,
    };
  }

  async createChannel(createChannelDto: CreateChannelDto) {
    const validator = this.validatorFactory.resolve(createChannelDto.provider);
    const profile = await validator.validate(createChannelDto.credentials);
    const channel = await this.channelsRepository.createChannel({
      provider: createChannelDto.provider,
      externalId: profile.externalId,
      name: createChannelDto.name?.trim() || profile.name,
      credentials: this.channelCredentialsService.encryptCredentials(
        createChannelDto.credentials,
      ),
      profile: profile.profile,
    });

    return this.serializeChannel(channel);
  }

  async updateChannel(channelId: string, updateChannelDto: UpdateChannelDto) {
    const channel = await this.channelsRepository.findChannelById(channelId);

    if (!channel) {
      throw new NotFoundException('Channel not found.');
    }

    const currentCredentials = this.channelCredentialsService.decryptCredentials(
      channel.credentials,
    );
    const nextCredentials = {
      ...currentCredentials,
      ...(updateChannelDto.credentials ?? {}),
    };
    const validator = this.validatorFactory.resolve(channel.provider);
    const profile = await validator.validate(nextCredentials);
    const updatedChannel = await this.channelsRepository.updateChannel(channel, {
      externalId: profile.externalId,
      name: updateChannelDto.name?.trim() || channel.name,
      credentials: this.channelCredentialsService.encryptCredentials(nextCredentials),
      profile: profile.profile,
    });

    return this.serializeChannel(updatedChannel);
  }

  private serializeChannel(channel: ChannelModel) {
    return {
      id: channel.id,
      provider: channel.provider,
      externalId: channel.externalId,
      name: channel.name,
      credentials: this.channelCredentialsService.maskCredentials(channel.credentials),
      profile: channel.profile,
      isActive: channel.isActive,
    };
  }
}

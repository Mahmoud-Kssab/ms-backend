import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes, UniqueConstraintError } from 'sequelize';

import { ChannelProvider } from '../enums/channel-provider.enum';
import { ChannelModel } from '../models/channel.model';

@Injectable()
export class ChannelsRepository {
  constructor(
    @InjectModel(ChannelModel)
    private readonly channelModel: typeof ChannelModel,
  ) {}

  async listActiveChannels() {
    return this.channelModel.findAll({
      where: {
        isActive: true,
      },
      order: [['created_at', 'DESC']],
    });
  }

  async findChannelById(channelId: string) {
    return this.channelModel.findByPk(channelId);
  }

  async createChannel(payload: {
    provider: ChannelProvider;
    externalId: string;
    name: string;
    credentials: Record<string, unknown>;
    profile: Record<string, unknown>;
  }) {
    try {
      return await this.channelModel.create({
        provider: payload.provider,
        externalId: payload.externalId,
        name: payload.name,
        credentials: payload.credentials,
        profile: payload.profile,
        isActive: true,
      } as CreationAttributes<ChannelModel>);
    } catch (error) {
      this.handleUniqueConstraint(error);
    }
  }

  async updateChannel(
    channel: ChannelModel,
    payload: {
      externalId: string;
      name: string;
      credentials: Record<string, unknown>;
      profile: Record<string, unknown>;
    },
  ) {
    try {
      return await channel.update({
        externalId: payload.externalId,
        name: payload.name,
        credentials: payload.credentials,
        profile: payload.profile,
      });
    } catch (error) {
      this.handleUniqueConstraint(error);
    }
  }

  private handleUniqueConstraint(error: unknown): never {
    if (error instanceof UniqueConstraintError) {
      throw new ConflictException(
        'This external account is already connected to another channel.',
      );
    }

    throw error;
  }
}

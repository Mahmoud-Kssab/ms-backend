import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

import { ChannelProvider } from '../enums/channel-provider.enum';

export class CreateChannelDto {
  @IsEnum(ChannelProvider)
  provider!: ChannelProvider;

  @IsObject()
  credentials!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  name?: string;
}

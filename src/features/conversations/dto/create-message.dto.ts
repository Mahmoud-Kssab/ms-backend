import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { MessageDirection } from '../enums/message-direction.enum';

export class CreateMessageDto {
  @IsEnum(MessageDirection)
  direction!: MessageDirection;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  body!: string;

  @IsOptional()
  @IsString()
  clientMessageId?: string;
}

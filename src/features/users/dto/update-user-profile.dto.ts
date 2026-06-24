import { IsEmail, IsString } from 'class-validator';

export class UpdateUserProfileDto {
  @IsEmail()
  email!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;
}

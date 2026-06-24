import { ArrayUnique, IsArray, IsEnum } from 'class-validator';

import { PermissionKey } from '../enums/permission-key.enum';

export class UpdateRolePermissionsDto {
  @IsArray()
  @ArrayUnique()
  @IsEnum(PermissionKey, { each: true })
  permissions!: PermissionKey[];
}

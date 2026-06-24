import { SetMetadata } from '@nestjs/common';

import { PermissionKey } from '../enums/permission-key.enum';

export const PERMISSIONS_METADATA_KEY = 'permissions';

export const Permissions = (...permissions: PermissionKey[]) =>
  SetMetadata(PERMISSIONS_METADATA_KEY, permissions);

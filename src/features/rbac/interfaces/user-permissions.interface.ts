import { PermissionKey } from '../enums/permission-key.enum';

export interface UserPermissions {
  userId: string;
  permissions: PermissionKey[];
}

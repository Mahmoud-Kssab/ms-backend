import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from '../auth/auth.module';
import { PermissionModel } from './models/permission.model';
import { RolePermissionModel } from './models/role-permission.model';
import { RoleModel } from './models/role.model';
import { UserRoleModel } from './models/user-role.model';
import { UserModel } from './models/user.model';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesController } from './controllers/roles.controller';
import { RbacRepository } from './repositories/rbac.repository';
import { RbacService } from './services/rbac.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      UserModel,
      RoleModel,
      PermissionModel,
      UserRoleModel,
      RolePermissionModel,
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [RolesController],
  providers: [RbacRepository, RbacService, PermissionsGuard],
  exports: [RbacService, PermissionsGuard],
})
export class RbacModule {}

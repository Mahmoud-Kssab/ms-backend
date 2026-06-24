import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { RbacModule } from '../rbac/rbac.module';
import { RoleModel } from '../rbac/models/role.model';
import { UserRoleModel } from '../rbac/models/user-role.model';
import { UserModel } from '../rbac/models/user.model';
import { AuthController } from './controllers/auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { AuthRepository } from './repositories/auth.repository';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel, RoleModel, UserRoleModel]),
    forwardRef(() => RbacModule),
  ],
  controllers: [AuthController],
  providers: [AuthRepository, AuthService, PasswordService, TokenService, AuthGuard],
  exports: [AuthGuard, AuthService, TokenService, PasswordService],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { RoleModel } from '../rbac/models/role.model';
import { UserRoleModel } from '../rbac/models/user-role.model';
import { UserModel } from '../rbac/models/user.model';
import { UsersController } from './controllers/users.controller';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './services/users.service';

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel, UserRoleModel, RoleModel]),
    AuthModule,
    RbacModule,
  ],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
})
export class UsersModule {}

import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../../auth/guards/auth.guard';
import { Permissions } from '../../rbac/decorators/permissions.decorator';
import { PermissionKey } from '../../rbac/enums/permission-key.enum';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserPasswordDto } from '../dto/update-user-password.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { UpdateUserRolesDto } from '../dto/update-user-roles.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
@UseGuards(AuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions(PermissionKey.UserRead)
  listUsers() {
    return this.usersService.listUsers();
  }

  @Post()
  @Permissions(PermissionKey.UserManage)
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Patch(':id/roles')
  @Permissions(PermissionKey.UserManage)
  updateUserRoles(
    @Param('id') userId: string,
    @Body() updateUserRolesDto: UpdateUserRolesDto,
  ) {
    return this.usersService.updateUserRoles(userId, updateUserRolesDto.roleIds);
  }

  @Patch(':id/profile')
  @Permissions(PermissionKey.UserManage)
  updateUserProfile(
    @Param('id') userId: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateUserProfile(userId, updateUserProfileDto);
  }

  @Patch(':id/password')
  @Permissions(PermissionKey.UserManage)
  updateUserPassword(
    @Param('id') userId: string,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    return this.usersService.updateUserPassword(userId, updateUserPasswordDto);
  }

  @Patch(':id/status')
  @Permissions(PermissionKey.UserManage)
  updateUserStatus(
    @Param('id') userId: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateUserStatus(userId, updateUserStatusDto);
  }
}

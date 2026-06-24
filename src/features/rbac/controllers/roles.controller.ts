import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../../auth/guards/auth.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRolePermissionsDto } from '../dto/update-role-permissions.dto';
import { PermissionKey } from '../enums/permission-key.enum';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RbacService } from '../services/rbac.service';

@Controller()
@UseGuards(AuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  @Permissions(PermissionKey.RoleRead)
  listRoles() {
    return this.rbacService.listRoles();
  }

  @Post('roles')
  @Permissions(PermissionKey.RoleManage)
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rbacService.createRole(createRoleDto);
  }

  @Patch('roles/:id/permissions')
  @Permissions(PermissionKey.RoleManage)
  async updateRolePermissions(
    @Param('id') roleId: string,
    @Body() updateRolePermissionsDto: UpdateRolePermissionsDto,
  ) {
    const role = await this.rbacService.updateRolePermissions(
      roleId,
      updateRolePermissionsDto.permissions,
    );

    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    return role;
  }

  @Get('permissions')
  @Permissions(PermissionKey.RoleRead)
  listPermissions() {
    return this.rbacService.listPermissions();
  }
}

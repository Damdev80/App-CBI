import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { GroupRole, Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Post('users/reset-by-email')
  resetPasswordByEmail(@Body() body: { email: string; password?: string }) {
    return this.adminService.resetPasswordByEmail(body.email, body.password);
  }

  @Post('users/:id/reset-password')
  resetPassword(
    @Param('id') id: string,
    @Body() body?: { password?: string },
  ) {
    return this.adminService.resetPassword(id, body?.password);
  }

  @Post('users/:id/set-active')
  setUserActive(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.adminService.setUserActive(id, body.isActive);
  }

  @Post('users/:id/set-role')
  setUserRole(@Param('id') id: string, @Body() body: { role: Role }) {
    return this.adminService.setUserRole(id, body.role);
  }

  @Post('members/set-group-role')
  setGroupRole(
    @Body() body: { userId: string; groupId: string; groupRole: GroupRole },
  ) {
    return this.adminService.setMemberGroupRole(
      body.userId,
      body.groupId,
      body.groupRole,
    );
  }
}

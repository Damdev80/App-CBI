import { Controller, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Get } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Roles(
      Role.ADMIN,
      Role.SEMI_ADMIN,
      Role.CONTADORA,
      Role.LIDER_GRUPO,
      Role.LIDER,
      Role.SERVIDOR,
      Role.USER,
    )
    @Get('role-summary')
    async getRoleSummary(@Req() req) {
      return this.dashboardService.getRoleSummary(req.user.id, req.user.role);
    }

    @Roles(Role.ADMIN, Role.SEMI_ADMIN)
    @Get('/numberUser')
    async numberUserExists(): Promise<number> {
        return await this.dashboardService.numberUserExists();
    }

    @Roles(Role.ADMIN, Role.SEMI_ADMIN)
    @Get('/bautized')
    async numberPersonBautized(): Promise<number> {
        return await this.dashboardService.numberPersonBautized();
    }

    @Roles(Role.ADMIN, Role.SEMI_ADMIN)
    @Get('/womenRegistered')
    async numberwomenRegistered(): Promise<number> {
        return await this.dashboardService.numberwomenRegistered();
    }
    
    @Roles(Role.ADMIN, Role.SEMI_ADMIN, Role.CONTADORA)
    @Get('/countUnpaid')
    async countUnpaidParticipants(): Promise<number> {
        return await this.dashboardService.countUnpaidParticipants();
    }
    
}

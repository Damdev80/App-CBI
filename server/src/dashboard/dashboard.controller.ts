import { Controller } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Get } from '@nestjs/common';
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('/numberUser')
    async numberUserExists(): Promise<number> {
        return await this.dashboardService.numberUserExists();
    }
}

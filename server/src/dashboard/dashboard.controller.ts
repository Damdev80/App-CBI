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

    @Get('/bautized')
    async numberPersonBautized(): Promise<number> {
        return await this.dashboardService.numberPersonBautized();
    }


    @Get('/womenRegistered')
    async numberwomenRegistered(): Promise<number> {
        return await this.dashboardService.numberwomenRegistered();
    }
    
    @Get('/countUnpaid')
    async countUnpaidParticipants(): Promise<number> {
        return await this.dashboardService.countUnpaidParticipants();
    }
    
}

import { Controller, Get } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { PrismaClient } from '@prisma/client';
@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) {}

//    @Get('/')

}

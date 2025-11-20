import { Controller } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { PrismaClient } from '@prisma/client';
@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) {}

    async getAllGroups() {
        return await this.groupsService.findAllGroups();
    }

    async getGroupById(id: string) {
        return await this.groupsService.findByIdGroup(id);
    }

    
}

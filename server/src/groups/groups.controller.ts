import { Controller, Get, Param, Post, UsePipes, Body } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { IGroup } from './group.interfaces';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { createGroupSchema } from 'src/schemas/create-group.schema';
@Controller('group')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) {}

    @Get('/groups')
    async getAllGroups(): Promise<IGroup[]> {
        return await this.groupsService.findAllGroups();
    }

    @Get('/groups/id')
    async getByIdGroup(@Param('id') id: string): Promise<IGroup | null> {
        return await this.groupsService.findByIdGroup(id);
    }

    @Post('/create')
    @UsePipes(new ZodValidationPipe(createGroupSchema))
    async createGroup(@Body() body: Omit<IGroup, 'id' | 'createdAt' | 'updatedAt'>,): Promise<IGroup> {
        
        
        return await this.groupsService.createGroup(body);
    }

    

}

import { Controller, Get, Param, Post, UsePipes, Body } from '@nestjs/common';
import { GroupsService, CreateGroupDto } from './groups.service';
import { Groups } from '@prisma/client';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { createGroupSchema } from 'src/schemas/create-group.schema';

@Controller('group')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) {}

    @Get('/groups')
    async getAllGroups(): Promise<Groups[]> {
        return await this.groupsService.findAllGroups();
    }

    @Get('/groups/id')
    async getByIdGroup(@Param('id') id: string): Promise<Groups | null> {
        return await this.groupsService.findByIdGroup(id);
    }

    @Post('/create')
    @UsePipes(new ZodValidationPipe(createGroupSchema))
    async createGroup(@Body() body: CreateGroupDto): Promise<Groups> {
        return await this.groupsService.createGroup(body);
    }

    @Get('/groups/names')
    async getAllGroupNames(): Promise<{ name: string }[]> {
        return await this.groupsService.findAllGroupNames();
    }
}

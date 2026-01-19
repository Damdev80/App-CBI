import { Delete, Query } from '@nestjs/common';       
import { Body, Controller, Get, Param, Post, Patch, UsePipes } from '@nestjs/common';
import { MembersService } from './members.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { createMemberSchema } from 'src/schemas/create-members.schema';
import { Members, Prisma } from '@prisma/client';

@Controller('member')
export class MembersController {
    constructor(private readonly membersService: MembersService) {}

    @Patch('/members/level')
    async updateLevelDicipules(@Body() body: { userId: string; groupId: string; levelDicipules: string }) {
        return this.membersService.updateLevelDicipules(body.userId, body.groupId, body.levelDicipules);
    }

    @Get('/members')
    async getAllMembers(): Promise<Members[]> {
        return await this.membersService.findAllMembers();
    }

    @Get('/members/id')
    async getByIdMembers(@Param('id') id: string): Promise<Members | null> {
        return await this.membersService.findByIdMember(id);
    }

    @Get('/members/group/:groupId')
    async getByGroupIdMembers(@Param('groupId') groupId: string): Promise<Members[]> {
        return await this.membersService.findMenberByGroupId(groupId);
    }

    @Post('/create')
    @UsePipes(new ZodValidationPipe(createMemberSchema))
    async createMember(@Body() body: Prisma.MembersUncheckedCreateInput): Promise<Members> {
        return await this.membersService.createMember(body);
    }

    @Get('/members/user/:userId/groups')
    async getGroupsByUserId(@Param('userId') userId: string): Promise<any[]> {
        // Devuelve [{ groupId, group: { name }, levelDicipules }]
        return await this.membersService.findGroupsByUserId(userId);
    }

    @Delete('/members/user-group')
        async leaveGroup(@Query('userId') userId: string, @Query('groupId') groupId: string) {
            // Elimina el registro Members para ese userId y groupId
            return this.membersService.leaveGroup(userId, groupId);
        }
}

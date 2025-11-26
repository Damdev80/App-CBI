import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import { MembersService } from './members.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { createMemberSchema } from 'src/schemas/create-members.schema';
import { Members, Prisma } from '@prisma/client';

@Controller('member')
export class MembersController {
    constructor(private readonly membersService: MembersService) {}

    @Get('/members')
    async getAllMembers(): Promise<Members[]> {
        return await this.membersService.findAllMembers();
    }

    @Get('/members/id')
    async getByIdMembers(@Param('id') id: string): Promise<Members | null> {
        return await this.membersService.findByIdMember(id);
    }

    @Post('/create')
    @UsePipes(new ZodValidationPipe(createMemberSchema))
    async createMember(@Body() body: Prisma.MembersUncheckedCreateInput): Promise<Members> {
        return await this.membersService.createMember(body);
    }
}

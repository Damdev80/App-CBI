import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import { MembersService } from './members.service'; 
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { createMemberSchema } from 'src/schemas/create-members.schema';
import { IMembers } from './member.interfaces';
@Controller('member')
export class MembersController {
    constructor(private readonly membersService: MembersService) {}

    @Get('/members')
    async getAllMembers(): Promise<IMembers[]>{
        return await this.membersService.findAllMembers();
    }

    @Get('/members/id')
    async getByIdMembers(@Param('id') id: string): Promise<IMembers | null> {
        return await this.membersService.findByIdMember(id);
    }

    @Post('/create')
    @UsePipes(new ZodValidationPipe(createMemberSchema))
    async createMember(@Body() Body: Omit<IMembers, 'id'| 'joinedAt'>): Promise<IMembers> {
        return await this.membersService.createMember(Body);
    }


  
}

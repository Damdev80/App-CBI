import { Controller, Get, Post } from '@nestjs/common';
import { MembersService } from './members.service'; 
@Controller('members')
export class MembersController {
    constructor(private readonly membersService: MembersService) {}

    @Get('/')
    async getAllMembers() {
        return await this.membersService.findAllMembers();
    }

    @Post('/create')
    async createMember() {
        return await this.membersService.createMember();
    }

    
}

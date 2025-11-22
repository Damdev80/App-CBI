import { Controller, Get, Post, Param, Body, UsePipes } from '@nestjs/common';
import { EventUserService } from './event-user.service';
import { UsersEvent } from '@prisma/client';
import {createUserEventSchema } from 'src/schemas/create-userEvent.schema';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@Controller('event-user')
export class EventUserController {
    constructor(private readonly eventUserService: EventUserService) {}

    @Get('/event-users')
    async getAllEventUsers(): Promise<UsersEvent[]> {
        return await this.eventUserService.getAllEventUsers();
    }

    @Get('/event-users/id')
    async getByIdEventUser(@Param('id') id: string): Promise<UsersEvent | null> {
        return await this.eventUserService.getByIdEventUser(id);
    }

    @Post('/create')
    @UsePipes(new ZodValidationPipe(createUserEventSchema))
    async createEventUser(@Body() body: Omit<UsersEvent, 'id' | 'createdAt' | 'updatedAt'>,): Promise<UsersEvent> {
        return await this.eventUserService.createEventUser(body);
    }
}

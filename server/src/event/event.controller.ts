import { Controller, Get, Post, Param, Body, UsePipes } from '@nestjs/common';
import { EventService } from './event.service';
import { IEvent } from './event.interfaces';
import {createEventSchema } from 'src/schemas/create-event.schema';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
@Controller('event')
export class EventController {
    constructor(private readonly eventService: EventService) {}

    @Get('/events')
    async getAllEvents(): Promise<IEvent[]> {
        return await this.eventService.getAllEvents();
    }
    @Get('/events/id')
    async getByIdEvent(@Param('id') id: string): Promise<IEvent | null> {
        return await this.eventService.getByIdEvent(id);
    }
    @Post('/create')
    @UsePipes(new ZodValidationPipe(createEventSchema))
    async createEvent(@Body() body: Omit<IEvent, 'id' | 'createdAt' | 'updatedAt'>,): Promise<IEvent> {
        return await this.eventService.createEvent(body);
    }
}

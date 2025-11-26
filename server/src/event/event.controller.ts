import { Controller, Get, Post, Param, Body, UsePipes } from '@nestjs/common';
import { EventService, CreateEventDto } from './event.service';
import { Event } from '@prisma/client';
import { createEventSchema } from 'src/schemas/create-event.schema';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@Controller('event')
export class EventController {
    constructor(private readonly eventService: EventService) {}

    @Get('/events')
    async getAllEvents(): Promise<Event[]> {
        return await this.eventService.getAllEvents();
    }

    @Get('/events/id')
    async getByIdEvent(@Param('id') id: string): Promise<Event | null> {
        return await this.eventService.getByIdEvent(id);
    }

    @Post('/create')
    @UsePipes(new ZodValidationPipe(createEventSchema))
    async createEvent(@Body() body: CreateEventDto): Promise<Event> {
        return await this.eventService.createEvent(body);
    }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Event, Prisma } from '@prisma/client';

export type CreateEventDto = Prisma.EventCreateInput;
export type UpdateEventDto = Prisma.EventUpdateInput;

@Injectable()
export class EventService {
    constructor(private prisma: PrismaService) {}

    async getAllEvents(): Promise<Event[]> {
        return await this.prisma.event.findMany();
    }

    async getByIdEvent(id: string): Promise<Event | null> {
        return await this.prisma.event.findUnique({
            where: { id },
        });
    }

    async createEvent(data: CreateEventDto): Promise<Event> {
        return await this.prisma.event.create({
            data,
        });
    }

    

}

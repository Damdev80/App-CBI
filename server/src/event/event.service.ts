import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IEvent } from './event.interfaces';
@Injectable()
export class EventService {
    constructor(private prisma: PrismaService) {}

    async getAllEvents(): Promise<IEvent[]> {
        return await this.prisma.event.findMany();
    }

    async getByIdEvent(id: string): Promise<IEvent | null> {
        return await this.prisma.event.findUnique({
            where: { id },
        });
    }

    async createEvent(data: Omit< IEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<IEvent> {
        return await this.prisma.event.create({
            data: {
                ...data,
            },
        });
    }

    

}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Event, Prisma } from '@prisma/client';

export type CreateEventDto = Prisma.EventCreateInput;
export type UpdateEventDto = Prisma.EventUpdateInput;

@Injectable()
export class EventService {
    constructor(private prisma: PrismaService) {}

    private readonly minPrice = 1;
    private readonly maxPrice = 1_000_000;

    async getAllEvents(): Promise<Event[]> {
        return await this.prisma.event.findMany();
    }

    async getByIdEvent(id: string): Promise<Event | null> {
        return await this.prisma.event.findUnique({
            where: { id },
        });
    }

    async createEvent(data: CreateEventDto): Promise<Event> {
        const rawPrice = Number(data.priceTier ?? 0);
        const boundedPrice = Number.isFinite(rawPrice)
            ? Math.min(this.maxPrice, Math.max(this.minPrice, Math.round(rawPrice)))
            : this.minPrice;

        const normalizedData: CreateEventDto = {
            ...data,
            priceTier: data.hasPrice ? boundedPrice : 0,
        };

        return await this.prisma.event.create({
            data: normalizedData,
        });
    }

    

}

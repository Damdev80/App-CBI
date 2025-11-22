import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersEvent } from '@prisma/client';
@Injectable()
export class EventUserService {
    constructor(private prisma: PrismaService) {}

    async getAllEventUsers(): Promise<UsersEvent[]> {
        return await this.prisma.usersEvent.findMany();
    }

    async getByIdEventUser(id: string): Promise<UsersEvent | null> {
        return await this.prisma.usersEvent.findUnique({
            where: { id },
        });
    }

    async createEventUser(data: Omit<UsersEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<UsersEvent> {
        return await this.prisma.usersEvent.create({
            data: {
                ...data,
            },
        });
    }
}

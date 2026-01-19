import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionsService {
    constructor(private prisma: PrismaService) {}

    async getAllSessions() {
        return await this.prisma.session.findMany();
    }

    async getSessionById(id: string) {
        return await this.prisma.session.findUnique({
            where: { id },
        });
    }

    async getSessionsByGroupId(groupId: string) {
        return await this.prisma.session.findMany({
            where: { groupId },
        })
    }

    async createSession(data: { title: string; description?: string; date?: Date; groupId: string }) {
        return await this.prisma.session.create({
            data,
        });
    }


    async isUserInGroup(userId: string, groupId: string): Promise<boolean> {
    const member = await this.prisma.members.findFirst({
        where: { userId, groupId },
    });
    return !!member;
}
}

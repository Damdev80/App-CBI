import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IGroup } from './group.interfaces';
@Injectable()
export class GroupsService {
    constructor(private prisma: PrismaService) {}

    async findAllGroups(): Promise<IGroup[]> {
        return await this.prisma.groups.findMany();
    }

    async findByIdGroup(id: string): Promise<IGroup | null> {
        return await this.prisma.groups.findUnique({
            where: { id},
        })
    }

    async createGroup(data: Omit<IGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGroup> {
        return await this.prisma.groups.create({
            data: {
                ...data,
            },
        });
    }
}

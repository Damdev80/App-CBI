import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Groups, Prisma } from '@prisma/client';

export type CreateGroupDto = Prisma.GroupsCreateInput;
export type UpdateGroupDto = Prisma.GroupsUpdateInput;

@Injectable()
export class GroupsService {
    constructor(private prisma: PrismaService) {}

    async findAllGroups(): Promise<Groups[]> {
        return await this.prisma.groups.findMany();
    }

    async findByIdGroup(id: string): Promise<Groups | null> {
        return await this.prisma.groups.findUnique({
            where: { id },
        });
    }

    async createGroup(data: CreateGroupDto): Promise<Groups> {
        if (data.name) {
            const existingGroup = await this.prisma.groups.findUnique({
                where: { name: data.name },
            });
        }

        return await this.prisma.groups.create({
            data,
        });
    }
}

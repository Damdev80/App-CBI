import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Groups, Prisma } from '@prisma/client';
export type CreateGroupDto = Prisma.GroupsCreateInput;
export type UpdateGroupDto = Prisma.GroupsUpdateInput;

export interface CreateJoinRequestDto {
  groupName: string;
  name: string;
  phone: string;
  message?: string;
}

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

    async findAllGroupNames(): Promise<{ name: string }[]> {
        return await this.prisma.groups.findMany({
            select: { name: true },
        });
    }

    async createJoinRequest(data: CreateJoinRequestDto) {
        return await this.prisma.groupJoinRequest.create({ data });
    }

    async findAllJoinRequests() {
        return await this.prisma.groupJoinRequest.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
}

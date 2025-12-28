import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Members, Prisma } from '@prisma/client';

export type CreateMemberDto = Prisma.MembersCreateInput;
export type UpdateMemberDto = Prisma.MembersUpdateInput;

@Injectable()
export class MembersService {
    constructor(private prisma: PrismaService) {}

    async findAllMembers(): Promise<Members[]> {
        try {
            return await this.prisma.members.findMany();
        } catch (error) {
            throw new InternalServerErrorException('Error al obtener los miembros');
        }
    }

    async findMenberByGroupId(groupId: string): Promise<Members[]> {
        try {
            return await this.prisma.members.findMany({
                where: { groupId },
            });
        } catch (error) {
            throw new InternalServerErrorException('Error al obtener los miembros por ID de grupo');
        }
        
    }


    async findByIdMember(id: string): Promise<Members | null> {
        try {
            return await this.prisma.members.findUnique({
                where: { id },
            });
        } catch (error) {
            throw new InternalServerErrorException('Error al obtener el miembro por ID');
        }
    }

    async createMember(data: Prisma.MembersUncheckedCreateInput): Promise<Members> {
        try {
            return await this.prisma.members.create({
                data,
            });
        } catch (error) {
            throw new InternalServerErrorException('Error al crear el miembro');
        }
    }

    async 
}

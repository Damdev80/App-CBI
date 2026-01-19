import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Members, Prisma, LevelDicipules } from '@prisma/client';

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

    async updateLevelDicipules(userId: string, groupId: string, levelDicipules: string): Promise<Members> {
        try {
            // Validar que el valor sea uno de los del enum
            if (!Object.values(LevelDicipules).includes(levelDicipules as LevelDicipules)) {
                throw new BadRequestException('Nivel de discipulado inválido');
            }
            return await this.prisma.members.update({
                where: {
                    userId_groupId: { userId, groupId }
                },
                data: { levelDicipules: levelDicipules as LevelDicipules },
            });
        } catch (error) {
            throw new InternalServerErrorException('Error al actualizar el nivel de discipulado');
        }
    }


    async findGroupsByUserId(userId: string): Promise<any[]> {
        try {
            return await this.prisma.members.findMany({
                where: { userId },
                include: {
                    group: {
                        select: { name: true }
                    }
                }
            });
        } catch (error) {
            throw new InternalServerErrorException('Error al obtener los grupos del usuario');
        }
    }

    async leaveGroup(userId: string, groupId: string): Promise<{ success: boolean }> {
            try {
                await this.prisma.members.delete({
                    where: { userId_groupId: { userId, groupId } },
                });
                return { success: true };
            } catch (error) {
                throw new InternalServerErrorException('Error al salir del grupo');
            }
        }
}

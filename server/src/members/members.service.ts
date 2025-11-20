import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IMembers} from './member.interfaces';
@Injectable()
export class MembersService {
    constructor(private prisma: PrismaService) {}

    async findAllMembers(): Promise<IMembers[]> {
        try {
            return await this.prisma.members.findMany();
        } catch (error) {
            throw new InternalServerErrorException('Error al obtener los miembros');
        }
    }


    async findByIdMember(id: string): Promise<IMembers | null> {
        try {
            return await this.prisma.members.findUnique({
                where: { id },
            })
        } catch (error) {
            throw new InternalServerErrorException('Error al obtener el miembro por ID');
        }
    }

    async createMember(data: Omit<IMembers, 'id' | 'joinedAt' | 'user' | 'group'>): Promise<IMembers> {
        try {
            return await this.prisma.members.create({
                data: {
                    ...data,
                },
            });
        } catch (error) {
            throw new InternalServerErrorException('Error al crear el miembro');
        }
    }
}

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersServiceService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    number?: string;
    teacherId: string;
    Gender: 'MASCULINO' | 'FEMENINO';
    Documents?: string;
  }) {
    try {
      return await this.prisma.userServiceSocial.create({
        data: {
          name: data.name,
          number: data.number,
          teacherId: data.teacherId,
          Gender: data.Gender,
          Documents: data.Documents,
        },
        include: { School: true },
      });
    } catch (error) {
      if (error?.code === 'P2002') {
        const field = error?.meta?.target?.[0] ?? 'campo';
        throw new ConflictException(`El ${field} ya está en uso`);
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.userServiceSocial.findMany({
      include: { School: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTeacher(teacherId: string) {
    return this.prisma.userServiceSocial.findMany({
      where: { teacherId },
      include: { School: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.userServiceSocial.findUnique({
      where: { id },
      include: { School: true },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async update(
    id: string,
    data: {
      name?: string;
      number?: string;
      attendance?: boolean;
      GoToCampement?: boolean;
      payGotoCampement?: 'PAGO' | 'DEBE';
      Gender?: 'MASCULINO' | 'FEMENINO';
      Documents?: string;
    },
  ) {
    await this.findOne(id);
    try {
      return await this.prisma.userServiceSocial.update({
        where: { id },
        data,
        include: { School: true },
      });
    } catch (error) {
      if (error?.code === 'P2002') {
        const field = error?.meta?.target?.[0] ?? 'campo';
        throw new ConflictException(`El ${field} ya está en uso`);
      }
      throw error;
    }
  }

  async toggleAttendance(id: string) {
    const user = await this.findOne(id);
    return this.prisma.userServiceSocial.update({
      where: { id },
      data: { attendance: !user.attendance },
      include: { School: true },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.userServiceSocial.delete({ where: { id } });
  }
}

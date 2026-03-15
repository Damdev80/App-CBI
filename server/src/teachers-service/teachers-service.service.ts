import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeachersServiceService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; number?: string }) {
    // Auto-generate unique teacherId
    const teacherId = `PROF-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    
    try {
      return await this.prisma.teachersService.create({
        data: {
          name: data.name,
          number: data.number,
          teacherId,
        },
        include: { students: true },
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
    return this.prisma.teachersService.findMany({
      include: { students: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const teacher = await this.prisma.teachersService.findUnique({
      where: { id },
      include: { students: true },
    });
    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
    }
    return teacher;
  }

  async update(
    id: string,
    data: { name?: string; number?: string; GoToCampement?: boolean },
  ) {
    await this.findOne(id);
    try {
      return await this.prisma.teachersService.update({
        where: { id },
        data,
        include: { students: true },
      });
    } catch (error) {
      if (error?.code === 'P2002') {
        const field = error?.meta?.target?.[0] ?? 'campo';
        throw new ConflictException(`El ${field} ya está en uso`);
      }
      throw error;
    }
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.teachersService.delete({ where: { id } });
  }
}

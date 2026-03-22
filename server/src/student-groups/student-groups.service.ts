import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentGroupsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; number?: string; teacherId?: string }) {
    return this.prisma.studentGroup.create({
      data: {
        name: data.name,
        number: data.number || null,
        teacherId: data.teacherId || null,
      },
      include: { students: true },
    });
  }

  async findAll(teacherId?: string) {
    const where = teacherId ? { teacherId } : {};
    return this.prisma.studentGroup.findMany({
      where,
      include: {
        teacher: true,
        students: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.studentGroup.findUnique({
      where: { id },
      include: { teacher: true, students: true },
    });
    if (!group) throw new NotFoundException('Grupo no encontrado');
    return group;
  }

  async update(id: string, data: { name?: string; number?: string; teacherId?: string }) {
    await this.findOne(id);
    return this.prisma.studentGroup.update({
      where: { id },
      data,
      include: { students: true },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.studentGroup.delete({ where: { id } });
  }
}

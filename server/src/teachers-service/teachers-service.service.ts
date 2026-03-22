import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeachersServiceService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; number?: string }) {
    // Auto-generate unique teacherId
    const teacherId = `PROF-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    
    return this.prisma.teachersService.create({
      data: {
        name: data.name,
        number: data.number,
        teacherId,
      },
      include: { students: true },
    });
  }

  async findAll() {
    const teachers = await this.prisma.teachersService.findMany({
      include: {
        students: true,
        studentTeachers: { select: { studentId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return teachers.map((t) => {
      const viaTeacher = new Set(t.students.map((s) => s.id));
      for (const st of t.studentTeachers) {
        viaTeacher.add(st.studentId);
      }
      return { ...t, _studentCount: viaTeacher.size };
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
    return this.prisma.teachersService.update({
      where: { id },
      data,
      include: { students: true },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.teachersService.delete({ where: { id } });
  }
}

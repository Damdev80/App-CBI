import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersServiceService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    number?: string;
    teacherIds: string[]; // Uno o más profesores
    Gender: 'MASCULINO' | 'FEMENINO';
    Documents?: string;
    groupId?: string;
  }) {
    const teacherIds = data.teacherIds?.length ? data.teacherIds : [];
    const firstTeacher = teacherIds[0] || null;
    return this.prisma.userServiceSocial.create({
      data: {
        name: data.name,
        number: data.number,
        teacherId: firstTeacher,
        Gender: data.Gender,
        Documents: data.Documents,
        groupId: data.groupId || null,
        studentTeachers: teacherIds.length
          ? { create: teacherIds.map((teacherId) => ({ teacherId })) }
          : undefined,
      },
      include: {
        School: true,
        group: true,
        studentTeachers: { include: { teacher: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.userServiceSocial.findMany({
      include: {
        School: true,
        group: true,
        studentTeachers: { include: { teacher: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTeacher(teacherId: string) {
    return this.prisma.userServiceSocial.findMany({
      where: {
        OR: [
          { teacherId },
          { studentTeachers: { some: { teacherId } } },
        ],
      },
      include: {
        School: true,
        group: true,
        studentTeachers: { include: { teacher: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.userServiceSocial.findUnique({
      where: { id },
      include: {
        School: true,
        group: true,
        studentTeachers: { include: { teacher: true } },
      },
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
      GoToCampement?: boolean;
      payGotoCampement?: 'PAGO' | 'DEBE';
      Gender?: 'MASCULINO' | 'FEMENINO';
      Documents?: string;
      groupId?: string | null;
      teacherIds?: string[];
    },
  ) {
    await this.findOne(id);
    const { teacherIds, ...rest } = data;
    return this.prisma.$transaction(async (tx) => {
      if (teacherIds !== undefined) {
        await tx.studentTeacher.deleteMany({ where: { studentId: id } });
        if (teacherIds.length > 0) {
          await tx.studentTeacher.createMany({
            data: teacherIds.map((teacherId) => ({ studentId: id, teacherId })),
          });
        }
      }
      const teacherIdUpdate =
        teacherIds !== undefined
          ? teacherIds.length > 0
            ? teacherIds[0]
            : null
          : undefined;
      return tx.userServiceSocial.update({
        where: { id },
        data: teacherIdUpdate !== undefined ? { ...rest, teacherId: teacherIdUpdate } : rest,
        include: {
          School: true,
          group: true,
          studentTeachers: { include: { teacher: true } },
        },
      });
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.userServiceSocial.delete({ where: { id } });
  }
}

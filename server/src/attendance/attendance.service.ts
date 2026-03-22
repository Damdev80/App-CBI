import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Filtro para estudiantes de un profesor (teacherId o studentTeachers) */
const studentFilterByTeacher = (teacherId: string): Prisma.UserServiceSocialWhereInput => ({
  OR: [
    { teacherId },
    { studentTeachers: { some: { teacherId } } },
  ],
});

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  /** Obtener asistencia de un domingo para los estudiantes de un profesor */
  async getByDateAndTeacher(date: string, teacherId: string) {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    const students = await this.prisma.userServiceSocial.findMany({
      where: studentFilterByTeacher(teacherId),
      include: {
        group: true,
        attendanceRecords: {
          where: { date: dateObj },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    return students.map((s) => ({
      id: s.id,
      name: s.name,
      number: s.number,
      Gender: s.Gender,
      group: s.group ? { id: s.group.id, name: s.group.name } : null,
      present: s.attendanceRecords[0]?.present ?? false,
      recordId: s.attendanceRecords[0]?.id ?? null,
    }));
  }

  /** Marcar asistencia en lote para una fecha (solo domingos) */
  async upsertBulk(
    date: string,
    teacherId: string,
    records: { studentId: string; present: boolean }[],
  ) {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    if (dateObj.getDay() !== 0) {
      throw new BadRequestException('Solo se puede pasar lista los domingos.');
    }

    const results: { id: string; present: boolean; studentId: string; date: Date }[] = [];
    for (const r of records) {
      const updated = await this.prisma.attendanceRecord.upsert({
        where: {
          studentId_date: {
            studentId: r.studentId,
            date: dateObj,
          },
        },
        create: {
          studentId: r.studentId,
          date: dateObj,
          present: r.present,
        },
        update: { present: r.present },
        include: { student: true },
      });
      results.push(updated);
    }
    return results;
  }

  /** Historial de domingos con asistencia (para reportes) */
  async getSundaysHistory(teacherId: string, from?: string, to?: string) {
    const where: Prisma.AttendanceRecordWhereInput = {
      student: studentFilterByTeacher(teacherId),
    };
    if (from || to) {
      where.date = {};
      if (from) (where.date as Prisma.DateTimeFilter).gte = new Date(from);
      if (to) (where.date as Prisma.DateTimeFilter).lte = new Date(to);
    }

    const records = await this.prisma.attendanceRecord.findMany({
      where,
      include: { student: { include: { group: true } } },
      orderBy: { date: 'desc' },
    });

    const byDate = new Map<string, { date: string; present: string[]; absent: string[]; students: { id: string; name: string; present: boolean; group: { id: string; name: string } | null }[] }>();
    for (const r of records) {
      const student = (r as { student: { id: string; name: string; group: { id: string; name: string } | null } }).student;
      const key = r.date.toISOString().slice(0, 10);
      if (!byDate.has(key)) {
        byDate.set(key, { date: key, present: [], absent: [], students: [] });
      }
      const entry = byDate.get(key)!;
      entry.students.push({
        id: student.id,
        name: student.name,
        present: r.present,
        group: student.group ? { id: student.group.id, name: student.group.name } : null,
      });
      if (r.present) entry.present.push(student.id);
      else entry.absent.push(student.id);
    }

    return Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date));
  }

  /** Conteo de fallas (ausencias) por estudiante - para marcar en rojo los de 2+ */
  async getAbsenceCounts(teacherId: string) {
    const students = await this.prisma.userServiceSocial.findMany({
      where: studentFilterByTeacher(teacherId),
      include: { attendanceRecords: { where: { present: false } } },
    });
    return students.map((s) => ({
      studentId: s.id,
      name: s.name,
      absenceCount: s.attendanceRecords.length,
      hasWarning: s.attendanceRecords.length > 2,
    }));
  }

  /** Resumen de asistencia por fecha (conteos) */
  async getSummaryByDate(date: string, teacherId?: string) {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    const recordWhere: Prisma.AttendanceRecordWhereInput = { date: dateObj };
    if (teacherId) {
      recordWhere.student = studentFilterByTeacher(teacherId);
    }

    const studentWhere = teacherId
      ? studentFilterByTeacher(teacherId)
      : {};
    const [total, present] = await Promise.all([
      this.prisma.userServiceSocial.count({ where: studentWhere }),
      this.prisma.attendanceRecord.count({
        where: { ...recordWhere, present: true },
      }),
    ]);

    return { total, present, absent: total - present };
  }
}

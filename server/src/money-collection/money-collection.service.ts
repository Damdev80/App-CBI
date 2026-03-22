import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MoneyCollectionService {
  constructor(private prisma: PrismaService) {}

  /** Registrar recolección individual por estudiante */
  async create(data: {
    date: string;
    amount: number;
    studentId: string;
    notes?: string;
  }) {
    const dateObj = new Date(data.date);
    dateObj.setHours(0, 0, 0, 0);

    return this.prisma.moneyCollection.create({
      data: {
        date: dateObj,
        amount: data.amount,
        studentId: data.studentId,
        notes: data.notes,
      },
      include: { student: true },
    });
  }

  /** Listar recolecciones con filtros (por estudiante o profesor) */
  async findAll(filters?: {
    studentId?: string;
    teacherId?: string;
    from?: string;
    to?: string;
  }) {
    const where: Record<string, unknown> = {};

    if (filters?.studentId) {
      where.studentId = filters.studentId;
    }
    if (filters?.teacherId) {
      where.student = {
        OR: [
          { teacherId: filters.teacherId },
          { studentTeachers: { some: { teacherId: filters.teacherId } } },
        ],
      };
    }
    if (filters?.from || filters?.to) {
      where.date = {};
      if (filters.from) {
        (where.date as Record<string, Date>).gte = new Date(filters.from);
      }
      if (filters.to) {
        (where.date as Record<string, Date>).lte = new Date(filters.to);
      }
    }

    const collections = await this.prisma.moneyCollection.findMany({
      where,
      include: { student: { include: { School: true } } },
      orderBy: { date: 'desc' },
    });

    return collections;
  }

  /** Total recaudado en un rango (por estudiante o profesor) */
  async getTotal(filters?: {
    studentId?: string;
    teacherId?: string;
    from?: string;
    to?: string;
  }) {
    const where: Record<string, unknown> = {};

    if (filters?.studentId) {
      where.studentId = filters.studentId;
    }
    if (filters?.teacherId) {
      where.student = {
        OR: [
          { teacherId: filters.teacherId },
          { studentTeachers: { some: { teacherId: filters.teacherId } } },
        ],
      };
    }
    if (filters?.from || filters?.to) {
      where.date = {};
      if (filters.from) {
        (where.date as Record<string, Date>).gte = new Date(filters.from);
      }
      if (filters.to) {
        (where.date as Record<string, Date>).lte = new Date(filters.to);
      }
    }

    const result = await this.prisma.moneyCollection.aggregate({
      where,
      _sum: { amount: true },
    });

    return result._sum.amount ?? 0;
  }
}

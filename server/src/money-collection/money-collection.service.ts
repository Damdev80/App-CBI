import { Injectable, NotFoundException } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { Pay } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MoneyCollectionInvoiceService } from './money-collection-invoice.service';

@Injectable()
export class MoneyCollectionService {
  constructor(
    private prisma: PrismaService,
    private invoiceService: MoneyCollectionInvoiceService,
  ) {}

  /** Registrar recolección individual por estudiante */
  async create(data: {
    date: string;
    amount: number;
    studentId: string;
    notes?: string;
    targetAmount?: number;
  }, meta?: { issuerName?: string }) {
    const dateObj = new Date(data.date);
    dateObj.setHours(0, 0, 0, 0);

    const created = await this.prisma.moneyCollection.create({
      data: {
        date: dateObj,
        amount: data.amount,
        studentId: data.studentId,
        notes: data.notes,
      },
      include: { student: { include: { group: true, School: true } } },
    });

    if (typeof data.targetAmount === 'number' && data.targetAmount > 0) {
      await this.recalculatePayStatusForStudents({
        expectedAmount: data.targetAmount,
        studentId: data.studentId,
      });
    }

    let invoiceInfo: {
      invoiceUrl: string;
      invoiceNumber: string;
      invoiceFileName: string;
    } | null = null;

    try {
      const invoice = await this.invoiceService.generateAndSaveInvoice({
        collection: created,
        issuerName: meta?.issuerName,
      });
      invoiceInfo = {
        invoiceUrl: this.invoiceService.getInvoicePublicUrl(created.id),
        invoiceNumber: invoice.invoiceNumber,
        invoiceFileName: invoice.fileName,
      };
    } catch {
      // Do not rollback payment creation if invoice generation fails.
      invoiceInfo = null;
    }

    return {
      ...created,
      invoice: invoiceInfo,
    };
  }

  async getInvoice(collectionId: string, issuerName?: string) {
    const collection = await this.prisma.moneyCollection.findUnique({
      where: { id: collectionId },
      include: { student: { include: { group: true, School: true } } },
    });

    if (!collection) {
      throw new NotFoundException('Pago no encontrado.');
    }

    const invoice = await this.invoiceService.ensureInvoice({
      collection,
      issuerName,
    });
    const buffer = await readFile(invoice.fullPath);

    return {
      buffer,
      fileName: invoice.fileName,
      invoiceNumber: invoice.invoiceNumber,
    };
  }

  /** Listar recolecciones con filtros (por estudiante o profesor) */
  async findAll(filters?: {
    studentId?: string;
    teacherId?: string;
    groupId?: string;
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
    if (filters?.groupId) {
      where.student = {
        ...(where.student as Record<string, unknown>),
        groupId: filters.groupId,
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
      include: { student: { include: { School: true, group: true } } },
      orderBy: { date: 'desc' },
    });

    return collections;
  }

  /** Total recaudado en un rango (por estudiante o profesor) */
  async getTotal(filters?: {
    studentId?: string;
    teacherId?: string;
    groupId?: string;
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
    if (filters?.groupId) {
      where.student = {
        ...(where.student as Record<string, unknown>),
        groupId: filters.groupId,
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

  async getDebtStatus(filters: {
    expectedAmount: number;
    studentId?: string;
    teacherId?: string;
    groupId?: string;
  }) {
    const expectedAmount = Number(filters.expectedAmount || 0);
    if (!expectedAmount || expectedAmount <= 0) return [];

    const students = await this.prisma.userServiceSocial.findMany({
      where: {
        ...(filters.studentId ? { id: filters.studentId } : {}),
        ...(filters.groupId ? { groupId: filters.groupId } : {}),
        ...(filters.teacherId
          ? {
              OR: [
                { teacherId: filters.teacherId },
                { studentTeachers: { some: { teacherId: filters.teacherId } } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        number: true,
        group: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    if (students.length === 0) return [];

    const totals = await this.prisma.moneyCollection.groupBy({
      by: ['studentId'],
      where: { studentId: { in: students.map((s) => s.id) } },
      _sum: { amount: true },
    });

    const totalByStudent = new Map(
      totals.map((t) => [t.studentId, Number(t._sum.amount ?? 0)]),
    );

    return students
      .map((student) => {
        const totalPaid = totalByStudent.get(student.id) ?? 0;
        const debt = Math.max(expectedAmount - totalPaid, 0);
        const status: Pay = debt > 0 ? 'DEBE' : 'PAGO';
        return {
          studentId: student.id,
          name: student.name,
          number: student.number,
          group: student.group,
          expectedAmount,
          totalPaid,
          debt,
          status,
        };
      })
      .sort((a, b) => b.debt - a.debt || a.name.localeCompare(b.name));
  }

  async getMorosos(filters: {
    expectedAmount: number;
    teacherId?: string;
    groupId?: string;
  }) {
    const status = await this.getDebtStatus(filters);
    return status.filter((s) => s.debt > 0);
  }

  async recalculatePayStatusForStudents(filters: {
    expectedAmount: number;
    studentId?: string;
    teacherId?: string;
    groupId?: string;
  }) {
    const status = await this.getDebtStatus(filters);
    if (status.length === 0) {
      return { updated: 0, expectedAmount: filters.expectedAmount };
    }

    await this.prisma.$transaction(
      status.map((s) =>
        this.prisma.userServiceSocial.update({
          where: { id: s.studentId },
          data: { payGotoCampement: s.status },
        }),
      ),
    );

    return {
      updated: status.length,
      expectedAmount: filters.expectedAmount,
      debtors: status.filter((s) => s.status === 'DEBE').length,
    };
  }
}

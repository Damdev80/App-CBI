import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export type CreateVisitorDto = {
  name: string;
  dateBorn: string;
  phone: string;
};

@Injectable()
export class VisitorsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateVisitorDto) {
    const row = await this.prisma.groupJoinRequest.create({
      data: {
        groupName: 'VISITANTE',
        name: data.name,
        phone: data.phone,
        message: `Fecha de nacimiento: ${data.dateBorn}`,
        status: 'PENDIENTE',
      },
    });

    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      dateBorn: data.dateBorn,
      createdAt: row.createdAt,
    };
  }

  async findAll() {
    const rows = await this.prisma.groupJoinRequest.findMany({
      where: { groupName: 'VISITANTE' },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => {
      const prefix = 'Fecha de nacimiento: ';
      const dateBorn = row.message?.startsWith(prefix) ? row.message.slice(prefix.length) : '';
      return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        dateBorn,
        createdAt: row.createdAt,
      };
    });
  }
}

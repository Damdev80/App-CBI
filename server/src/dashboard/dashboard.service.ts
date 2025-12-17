import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) {}

    async numberUserExists(): Promise<number> {
    return await this.prisma.user.count();
  }
}

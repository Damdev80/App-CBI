import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) {}

    async numberUserExists(): Promise<number> {
    return await this.prisma.user.count();
  }

    async numberPersonBautized(): Promise<number> {
        return await this.prisma.user.count({
          where: {
            baptized: true,
        }
      })
  }

    async numberwomenRegistered(): Promise<number> {
      return await this.prisma.user.count({
        where: {
          gender: 'FEMENINO',
        }
      })
    }
}

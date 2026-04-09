import { Injectable } from '@nestjs/common';
import { GroupRole, Role } from '@prisma/client';
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

    async countUnpaidParticipants(): Promise<number> {
      return await this.prisma.usersEvent.count({
        where: {
          payStatus: 'DEBE',
        }
      })
    }

    async getRoleSummary(userId: string, role: Role) {
      const isGlobalRole =
        role === Role.ADMIN || role === Role.SEMI_ADMIN || role === Role.CONTADORA;

      const memberships = await this.prisma.members.findMany({
        where: {
          userId,
          groupRole: { in: [GroupRole.LIDER_CABEZA, GroupRole.LIDER] },
        },
        select: {
          groupId: true,
          group: { select: { id: true, name: true } },
          groupRole: true,
        },
      });

      const leaderGroupIds = memberships.map((m) => m.groupId);
      const groupScope =
        role === Role.LIDER_GRUPO || role === Role.LIDER ? leaderGroupIds : undefined;

      const [totalUsers, totalBaptized, totalUnpaidEvents, forumPosts, groupSessions] =
        await Promise.all([
          this.prisma.user.count(),
          this.prisma.user.count({ where: { baptized: true } }),
          this.prisma.usersEvent.count({ where: { payStatus: 'DEBE' } }),
          this.prisma.forumPost.count({
            where: groupScope ? { groupId: { in: groupScope } } : undefined,
          }),
          this.prisma.session.count({
            where: groupScope ? { groupId: { in: groupScope } } : undefined,
          }),
        ]);

      const [serviceStudents, totalCollected, pendingServicePayments] = await Promise.all([
        this.prisma.userServiceSocial.count(),
        this.prisma.moneyCollection.aggregate({
          _sum: { amount: true },
        }),
        this.prisma.userServiceSocial.count({
          where: { payGotoCampement: 'DEBE' },
        }),
      ]);

      const modulesByRole = {
        [Role.ADMIN]: ['dashboard', 'finanzas', 'admin', 'grupos', 'foro', 'usuarios'],
        [Role.SEMI_ADMIN]: ['dashboard', 'finanzas', 'usuarios', 'foro'],
        [Role.CONTADORA]: ['dashboard', 'finanzas'],
        [Role.LIDER_GRUPO]: ['dashboard', 'foro', 'mi-grupo'],
        [Role.LIDER]: ['dashboard', 'foro', 'mi-grupo'],
        [Role.SERVIDOR]: ['dashboard', 'foro'],
        [Role.USER]: ['dashboard'],
      } as const;

      return {
        role,
        scope: isGlobalRole ? 'GLOBAL' : 'GROUP',
        groups: memberships.map((m) => ({
          id: m.group.id,
          name: m.group.name,
          groupRole: m.groupRole,
        })),
        modules: modulesByRole[role] ?? ['dashboard'],
        kpis: {
          totalUsers: isGlobalRole ? totalUsers : undefined,
          totalBaptized: isGlobalRole ? totalBaptized : undefined,
          totalUnpaidEvents: isGlobalRole ? totalUnpaidEvents : undefined,
          serviceStudents:
            role === Role.ADMIN || role === Role.SEMI_ADMIN || role === Role.CONTADORA
              ? serviceStudents
              : undefined,
          totalCollected:
            role === Role.ADMIN || role === Role.SEMI_ADMIN || role === Role.CONTADORA
              ? Number(totalCollected._sum.amount ?? 0)
              : undefined,
          pendingServicePayments:
            role === Role.ADMIN || role === Role.SEMI_ADMIN || role === Role.CONTADORA
              ? pendingServicePayments
              : undefined,
          forumPosts,
          groupSessions,
        },
      };
    }
}

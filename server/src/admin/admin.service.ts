import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { encryp } from '../lib/bcrypt';
import { GroupRole, Role } from '@prisma/client';

const DEFAULT_PASSWORD = '12345678';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /** Listar usuarios (sin contraseña) - solo admin */
  async getUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        number: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });
    return users;
  }

  /** Resetear contraseña por email (alternativa al ID) - útil para debugging */
  async resetPasswordByEmail(email: string, newPassword?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: email.trim().toLowerCase(), mode: 'insensitive' },
      },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado con ese email');
    }
    return this.resetPassword(user.id, newPassword);
  }

  /** Resetear contraseña - por defecto "12345678" o valor personalizado */
  async resetPassword(userId: string, newPassword?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const password = newPassword && newPassword.trim() ? newPassword.trim() : DEFAULT_PASSWORD;
    const hashedPassword = await encryp(password);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      message: `Contraseña de ${user.name || user.email || 'el usuario'} restablecida correctamente`,
    };
  }

  /** Activar o desactivar usuario */
  async setUserActive(userId: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    return {
      message: `${user.name || user.email} ${isActive ? 'activado' : 'desactivado'}`,
      isActive,
    };
  }

  async setUserRole(userId: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    return {
      message: `Rol actualizado a ${role}`,
      user: updated,
    };
  }

  async setMemberGroupRole(
    userId: string,
    groupId: string,
    groupRole: GroupRole,
  ) {
    const member = await this.prisma.members.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });
    if (!member) {
      throw new NotFoundException('Membresía usuario-grupo no encontrada');
    }
    const updated = await this.prisma.members.update({
      where: { userId_groupId: { userId, groupId } },
      data: { groupRole },
      include: {
        user: { select: { id: true, name: true, role: true } },
        group: { select: { id: true, name: true } },
      },
    });
    return {
      message: `Rol de grupo actualizado a ${groupRole}`,
      member: updated,
    };
  }

  /** Estadísticas para el panel de administración */
  async getStats() {
    const [total, active, admins, semis, leaders, accountants] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({ where: { role: 'SEMI_ADMIN' } }),
      this.prisma.user.count({ where: { role: 'LIDER_GRUPO' } }),
      this.prisma.user.count({ where: { role: 'CONTADORA' } }),
    ]);
    return {
      total,
      active,
      inactive: total - active,
      admins,
      semis,
      leaders,
      accountants,
    };
  }
}

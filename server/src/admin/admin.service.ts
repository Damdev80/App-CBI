import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { encryp } from '../lib/bcrypt';

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

  /** Estadísticas para el panel de administración */
  async getStats() {
    const [total, active, admins] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);
    return { total, active, inactive: total - active, admins };
  }
}

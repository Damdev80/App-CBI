import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IUser } from './intefaces/user.interfaces';
import { compare, encryp } from 'src/lib/bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<IUser[]> {
    return await this.prisma.user.findMany();
  }

  async findId(id: string): Promise<IUser | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<IUser> {
    if (!data.password) {
      throw new BadRequestException('La contraseña es OBLIGATORIA');
    }
    const hashedPassword = await encryp(data.password);
    return await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async validationUser(email: string, password: string): Promise<IUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    try {
      if (!user || !user.password) return null;

      // bcrypt.compare devuelve una promesa booleana → la resolvemos primero
      const isPasswordValid = await compare(password, user.password);

      if (isPasswordValid) {
        return user;
      }
    } catch (Error) {
      throw new BadRequestException(`El usuario ya existe${Error}`);
    }
    return null;
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser> {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deactivateUser(id: string): Promise<IUser> {
    return await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

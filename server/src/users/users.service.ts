/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IUser } from './user.interfaces';
import { compare, encryp } from 'src/lib/bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<IUser[]> {
    return await this.prisma.user.findMany();
  }

  async findById(id: string): Promise<IUser | null> {
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

    if(data.email){
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new BadRequestException('El email ya está en uso');
      }
    }
    const hashedPassword = await encryp(data.password);
    return await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });


  }

  async validationUser(
    email: string,
    password: string,
  ): Promise<Omit<IUser, 'password'> | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      if (!user || !user.password) return null;

      const isPasswordValid = await compare(password, user.password);

      if (!isPasswordValid) return null;

      //Desestruturar el objecto user para que no traiga la contraseña
      const { password: _, ...safeUser } = user;
      return safeUser;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error validando el usuario',
        (error as Error).message,
      );
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser> {
    const updateData = { ...data };

    if (data.password) {
      updateData.password = await encryp(data.password);
    }
    return await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async deactivateUser(id: string): Promise<IUser> {
    return await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

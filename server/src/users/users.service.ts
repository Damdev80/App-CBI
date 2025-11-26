/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { compare, encryp } from 'src/lib/bcrypt';

export type CreateUserDto = Prisma.UserCreateInput;
export type UpdateUserDto = Prisma.UserUpdateInput;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(
    data: CreateUserDto,
  ): Promise<User> {
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
  ): Promise<Omit<User, 'password'> | null> {
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

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const updateData = { ...data };

    if (data.password && typeof data.password === 'string') {
      updateData.password = await encryp(data.password);
    }
    return await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async deactivateUser(id: string): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { compare } from 'src/lib/bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async logIn(email: string, password: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });
      if (!user || !user.password) {
        throw new BadRequestException('Email o contraseña invalidos');
      }

      const isPasswordMatch = await compare(password, user.password);

      if (!isPasswordMatch) {
        throw new BadRequestException('Email o contraseña invalidos');
      }

      const { password: _, ...safeUser } = user;

      const payload = {
        ...safeUser,
      };

      const token_jwt = await this.jwtService.signAsync(payload);

      return { token_jwt };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al iniciar sesion');
    }
  }

  async signIn(name: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.userService.findById(name);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}

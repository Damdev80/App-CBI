import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly PrismaService: PrismaService,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userService: UsersService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.PrismaService.user.findUnique({
      where: { email },
    });
  }

  async register() {
    //Logica de validacion
    return this.PrismaService.user.create({});
  }
}

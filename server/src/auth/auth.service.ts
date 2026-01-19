import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.validationUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Incluir el rol en el payload del JWT
    const payload = { sub: user.id, username: user.name, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }


  async register(name: string, email: string, password: string){
   
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está en uso');
    }

    const newUser = await this.usersService.create({
      name,
      email,
      password,
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return userWithoutPassword;
  }
}

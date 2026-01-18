import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import  { JwtPayload }  from './jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    try {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: process.env.TOKEN_SECRET || 'your_jwt_secret',
      });
    } catch (err) {
      console.error('Error inicializando JwtStrategy:', err);
    }
  }

  async validate(payload: JwtPayload) {
    // payload.sub debe ser el id del usuario
    console.log('Payload recibido en JwtStrategy:', payload);
    const user = await this.usersService.findById(payload.sub);
    console.log('Usuario encontrado por ID:', user);
    if (!user) {
      console.log('No se encontró usuario con el ID:', payload.sub);
      return null;
    }
    return user;
  }
}
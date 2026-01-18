import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import {JwtStrategy} from "./jwt.strategy";

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.TOKEN_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [PrismaService, AuthService, JwtStrategy],
})
export class AuthModule {
  constructor() {
    process.on('unhandledRejection', (reason, promise) => {
      console.error('UNHANDLED REJECTION:', reason);
    });
    process.on('uncaughtException', (err) => {
      console.error('UNCAUGHT EXCEPTION:', err);
    });
  }
}

import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string; // id del usuario
  username?: string;
  email?: string;
  role: Role;
}
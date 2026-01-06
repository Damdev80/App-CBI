import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Gender } from '@prisma/client';

export interface PreRegisterUserDto {
    name: string;
    sexo: 'Masculino' | 'Femenino';
    number: string;
    address: string;
    baptized: boolean;
    group: string;
}

@Injectable()
export class PreRegisterService {
    constructor(private prisma: PrismaService) {}

    async preRegisterUser(data: PreRegisterUserDto): Promise<User> {
    // Validar que el número sea obligatorio
    if (!data.number) {
      throw new BadRequestException('El número de teléfono es obligatorio.');
    }

    // Verificar si el número ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { number: data.number },
    });

    if (existingUser) {
      throw new BadRequestException('Este número ya está pre-registrado.');
    }

    // Verificar que el grupo exista
    const group = await this.prisma.groups.findUnique({
      where: { name: data.group },
    });

    if (!group) {
      throw new BadRequestException('El grupo especificado no existe.');
    }

    // Convertir el sexo a Gender enum de Prisma
    const gender: Gender = data.sexo === 'Masculino' ? 'MASCULINO' : 'FEMENINO';

    // Crear el usuario pre-registrado (sin email ni password)
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        gender: gender,
        number: data.number,
        address: data.address,
        baptized: data.baptized,
      },
    });

    // Crear la relación en Members (asumiendo nivel I por defecto)
    await this.prisma.members.create({
      data: {
        userId: user.id,
        groupId: group.id,
        levelDicipules: 'I', // Nivel por defecto
      },
    });

    return user;
  }
}

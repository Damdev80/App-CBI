import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUsersEventDto,
  UpdateUsersEventDto,
} from './users-event.interfaces';

@Injectable()
export class UsersEventService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateUsersEventDto) {
    // Validar que el evento existe
    const event = await this.prisma.event.findUnique({
      where: { id: createDto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Si userId está presente, validar que existe
    if (createDto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: createDto.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    return this.prisma.usersEvent.create({
      data: {
        userId: createDto.userId,
        eventId: createDto.eventId,
        name: createDto.name,
        email: createDto.email,
        dateBorn: new Date(createDto.dateBorn),
        wayPay: createDto.wayPay,
        paymentAmount: createDto.paymentAmount,
        payStatus: createDto.payStatus || 'DEBE',
      },
      include: {
        event: true,
        user: true,
      },
    });
  }

  async findAll() {
    return this.prisma.usersEvent.findMany({
      include: {
        event: true,
        user: true,
      },
    });
  }

  async findOne(id: string) {
    const usersEvent = await this.prisma.usersEvent.findUnique({
      where: { id },
      include: {
        event: true,
        user: true,
      },
    });

    if (!usersEvent) {
      throw new NotFoundException('Registration not found');
    }

    return usersEvent;
  }

  async findByEvent(eventId: string) {
    return this.prisma.usersEvent.findMany({
      where: { eventId },
      include: {
        user: true,
      },
    });
  }

  async update(id: string, updateDto: UpdateUsersEventDto) {
    await this.findOne(id);

    return this.prisma.usersEvent.update({
      where: { id },
      data: {
        ...updateDto,
        ...(updateDto.dateBorn && {
          dateBorn: new Date(updateDto.dateBorn),
        }),
      },
      include: {
        event: true,
        user: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.usersEvent.delete({
      where: { id },
    });
  }
}

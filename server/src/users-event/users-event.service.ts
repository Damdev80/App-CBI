import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UsersEvent, Pay } from '@prisma/client';

export type CreateUsersEventDto = {
  eventId: string;
  userId?: string;
  name: string;
  email: string;
  dateBorn: string | Date;
  phone?: string;
  hasSiblings?: boolean;
};

export type UpdateUsersEventDto = Partial<Omit<Prisma.UsersEventUpdateInput, 'event' | 'user'>> & {
  dateBorn?: string | Date;
};

export type AddPaymentDto = {
  amount: number;
  wayPay: 'EFECTIVO' | 'TRANSFERENCIA';
};

@Injectable()
export class UsersEventService {
  constructor(private prisma: PrismaService) {}

  // Calcula el precio final del evento para un usuario
  private calculateFinalPrice(eventPrice: number, hasSiblings: boolean): number {
    const siblingDiscount = 10000;
    return hasSiblings ? eventPrice - siblingDiscount : eventPrice;
  }

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

    // Registro inicial: paymentAmount = 0, payStatus = DEBE
    return this.prisma.usersEvent.create({
      data: {
        eventId: createDto.eventId,
        userId: createDto.userId,
        name: createDto.name,
        email: createDto.email,
        dateBorn: new Date(createDto.dateBorn),
        phone: createDto.phone,
        hasSiblings: createDto.hasSiblings || false,
        paymentAmount: 0,  // Siempre empieza en 0
        payStatus: 'DEBE', // Siempre empieza debiendo
        wayPay: null,      // Se define cuando hace el primer abono
      },
      include: {
        event: true,
        user: true,
      },
    });
  }

  // Agregar un abono al registro
  async addPayment(id: string, paymentDto: AddPaymentDto) {
    const registration = await this.prisma.usersEvent.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (paymentDto.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    // Calcular precio final (con descuento si aplica)
    const finalPrice = this.calculateFinalPrice(
      registration.event.price,
      registration.hasSiblings
    );

    // Nuevo monto total pagado
    const newPaymentAmount = registration.paymentAmount + paymentDto.amount;

    // Determinar si ya está pagado
    const newPayStatus: Pay = newPaymentAmount >= finalPrice ? 'PAGO' : 'DEBE';

    return this.prisma.usersEvent.update({
      where: { id },
      data: {
        paymentAmount: newPaymentAmount,
        payStatus: newPayStatus,
        wayPay: paymentDto.wayPay,
      },
      include: {
        event: true,
        user: true,
      },
    });
  }

  // Obtener información de pago de un registro
  async getPaymentInfo(id: string) {
    const registration = await this.prisma.usersEvent.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const finalPrice = this.calculateFinalPrice(
      registration.event.price,
      registration.hasSiblings
    );

    return {
      ...registration,
      totalPrice: finalPrice,
      amountPaid: registration.paymentAmount,
      amountRemaining: Math.max(0, finalPrice - registration.paymentAmount),
      isPaid: registration.paymentAmount >= finalPrice,
    };
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

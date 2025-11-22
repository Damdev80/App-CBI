import { WayPay, Pay } from '@prisma/client';

export interface CreateUserEventDto {
    id?: string;
    name: string;
    email: string;
    phone: string;
    visitedAt?: Date;
    wayPay : WayPay;
    dateBorn: Date;
    paymentAmount: number;
    payStatus?: Pay;
}
import { number } from "zod";

export interface CreateUsersEventDto {
  userId?: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  dateBorn: string | Date;
  wayPay: 'EFECTIVO' | 'TRANSFERENCIA';
  paymentAmount: number;
  payStatus?: 'PAGO' | 'DEBE';
  hasSiblings?: boolean;
}

export interface UpdateUsersEventDto {
  name?: string;
  email?: string;
  dateBorn?: string | Date;
  wayPay?: 'EFECTIVO' | 'TRANSFERENCIA';
  phone?: string;
  paymentAmount?: number;
  payStatus?: 'PAGO' | 'DEBE';
}

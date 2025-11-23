export interface CreateUsersEventDto {
  userId?: string;
  eventId: string;
  name: string;
  email: string;
  dateBorn: string;
  wayPay: 'EFECTIVO' | 'TRANSFERENCIA';
  paymentAmount?: number;
  payStatus?: 'PAGO' | 'DEBE';
  hasSiblings?: boolean;
}

export interface UsersEvent {
  id: string;
  userId?: string;
  eventId: string;
  name: string;
  email: string;
  dateBorn: string;
  wayPay: 'EFECTIVO' | 'TRANSFERENCIA';
  paymentAmount: number;
  payStatus: 'PAGO' | 'DEBE';
  hasSiblings: boolean;
  createdAt: string;
  event?: Event;
  user?: User;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export type WayPay = 'EFECTIVO' | 'TRANSFERENCIA';
export type PayStatus = 'PAGO' | 'DEBE';
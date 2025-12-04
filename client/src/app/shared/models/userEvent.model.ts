export interface CreateUsersEventDto {
  userId?: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  dateBorn: string;
  hasSiblings?: boolean;
}

export interface AddPaymentDto {
  amount: number;
  wayPay: 'EFECTIVO' | 'TRANSFERENCIA';
}

export interface UsersEvent {
  id: string;
  userId?: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  dateBorn: string;
  wayPay?: 'EFECTIVO' | 'TRANSFERENCIA';
  paymentAmount: number;
  payStatus: 'PAGO' | 'DEBE';
  hasSiblings: boolean;
  createdAt: string;
  event?: Event;
  user?: User;
}

export interface PaymentInfo extends UsersEvent {
  totalPrice: number;
  amountPaid: number;
  amountRemaining: number;
  isPaid: boolean;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  price: number;
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
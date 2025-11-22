export interface CreateUsersEventDto {
  userId?: string;
  eventId: string;
  name: string;
  email: string;
  dateBorn: string | Date;
  wayPay: 'EFECTIVO' | 'TRANSFERENCIA';
  paymentAmount: number;
  payStatus?: 'PAGO' | 'DEBE';
}

export interface UpdateUsersEventDto {
  name?: string;
  email?: string;
  dateBorn?: string | Date;
  wayPay?: 'EFECTIVO' | 'TRANSFERENCIA';
  paymentAmount?: number;
  payStatus?: 'PAGO' | 'DEBE';
}

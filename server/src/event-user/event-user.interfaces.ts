import type { IEvent } from 'src/event/event.interfaces';

export enum WayPay {
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  
}

export enum Pay {
  DEBE = 'DEBE',
  PAGADO = 'PAGADO',
 
}

export interface IUserEvent {
  id: string;
  eventId: string;
  event?: IEvent;
  name: string;
  email: string;
  phone: string;
  visitedAt: Date;
  wayPay: WayPay;
  dateBorn: Date;
  paymentAmount: number;
  payStatus: Pay;
}
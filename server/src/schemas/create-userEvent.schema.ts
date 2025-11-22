import { z } from 'zod';
export const createUserEventSchema = z.object({
  userId: z.string().uuid().optional(),
  eventId: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  dateBorn: z.string().refine(d => !isNaN(Date.parse(d))).transform(d => new Date(d)),
  wayPay: z.enum(['EFECTIVO','TRANSFERENCIA']),
  paymentAmount: z.number().positive(),
  payStatus: z.enum(['DEBE']), // o z.enum(['PAGO','DEBE']) según tu enum Pay
});
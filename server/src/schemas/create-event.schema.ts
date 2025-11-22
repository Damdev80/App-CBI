import {z} from 'zod';

export const createEventSchema = z.object({
    name: z.string().min(4, 'El nombre del evento es obligatorio'),
    email: z.string().email('El email no es válido'),
    phone: z.string().min(7, 'El teléfono es obligatorio'),
    visitedAt: z.date().optional(),
    wayPay: z.enum(['EFECTIVO', 'TRANSFERENCIA']),
    dateBorn: z.date(),
    paymentAmount: z.number().min(0, 'El monto del pago debe ser mayor o igual a 0'),
    
})
import {z} from 'zod';

export const createEventSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    eventDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Formato de fecha inválido",
    }).transform((date) => new Date(date)),
})

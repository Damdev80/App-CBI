import {z} from 'zod';

const MAX_EVENT_PRICE = 1_000_000;

export const createEventSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    eventType: z.enum(['EVENTO', 'ACTIVIDAD', 'REUNION']).default('EVENTO'),
    hasPrice: z.boolean().default(false),
    priceTier: z.coerce.number().int().min(0).max(MAX_EVENT_PRICE).default(0),
    eventDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Formato de fecha inválido",
    }).transform((date) => new Date(date)),
}).refine((data) => !data.hasPrice || data.priceTier >= 1, {
    path: ['priceTier'],
    message: 'El precio debe estar entre 1 y 1.000.000 COP',
}).transform((data) => ({
    ...data,
    priceTier: data.hasPrice
        ? Math.min(MAX_EVENT_PRICE, Math.max(1, Math.round(data.priceTier)))
        : 0,
}))

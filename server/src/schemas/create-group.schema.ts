import {z} from 'zod';

export const createGroupSchema = z.object({
    name: z.string().min(4, 'El nombre del grupo es obligatorio'),
    description: z.string().optional(),
})
import { z } from 'zod';

export const preRegisterSchema = z.object({
    name: z.string().min(2, 'El nombre es demasiado corto'),
    sexo: z.enum(['Masculino', 'Femenino'], {
        message: 'El sexo debe ser Masculino o Femenino',
    }),
    number: z.string().min(10, 'El número debe tener al menos 10 dígitos'),
    address: z.string().min(5, 'La dirección es demasiado corta'),
    baptized: z.boolean(),
    group: z.string().min(1, 'Debes seleccionar un grupo'),
});

export type PreRegisterDto = z.infer<typeof preRegisterSchema>;
import { z } from 'zod';

export const loginSchema = z.object({
  name: z.string().min(3, 'El nombre es obligatorio'),
  email: z.string().email('Debe ser un email válido'),
  password: z.string().min(8, 'La contraseña es obligatoria'),
  happybirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Fecha de nacimiento inválida',
  }),
  age: z.number().min(0, 'La edad debe ser un número positivo'),
  address: z.string().min(5, 'La dirección es obligatoria'),
});

export type LoginDto = z.infer<typeof loginSchema>;

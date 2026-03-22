import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Debe ser un email válido').transform((s) => s.trim().toLowerCase()),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export type LoginDto = z.infer<typeof loginSchema>;

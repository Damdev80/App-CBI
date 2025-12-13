import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1, 'El nombre que intentas ingresar es muy corto,').optional(),
  number: z.string().min(10, 'El numero que intentas ingresa es muy corto.').optional(),
  password: z
    .string()
    .min(
      8,
      'Su contraseña es muy corta porfavor la contraseña debe ser mayor a 8 caracteres',
    ),
  gender: z.enum(['MASCULINO', 'FEMENINO']).optional(),
  age: z.number().min(10).max(120).optional(),
  address: z.string().optional(),
  happybirth: z.coerce.date().optional(),
  hobbies: z.string().optional(),
  dreams: z.string().optional(),
  job: z.string().optional(),
  vulnerable_area: z.string().optional(),
  role: z.string().optional(),
});



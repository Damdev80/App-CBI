import {z} from 'zod'

export const registerSchema = z.object({
    name: z.string().min(2, 'Tu nombre es demaciado corto'),
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().min(8, 'La contraseña es demaciado corta')
})

export type RegisterDto = z.infer<typeof registerSchema>
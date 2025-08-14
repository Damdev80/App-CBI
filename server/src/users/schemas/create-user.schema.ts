import { z } from "zod";

export const createUserSchema = z.object ({
    email: z.string().email(),
    name: z.string().min(1, "El nombre que intentas ingresar es muy corto,"),
    number: z.string().min(10, "El numero que intentas ingresa es muy corto."),
    password: z.string().min(8, "Su contraseña es muy corta porfavor la contraseña debe ser mayor a 8 caracteres"),
    age: z.number().min(10).max(120).optional(),
    address: z.string().optional(),
    happybirth: z.coerce.date().optional(), 
});
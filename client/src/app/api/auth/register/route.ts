import { NextResponse } from 'next/server';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').trim().toLowerCase(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const NESTJS_URL = process.env.NEXT_PUBLIC_NESTJS_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const response = await fetch(`${NESTJS_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al registrar' }));
      return NextResponse.json(
        { message: error.message || 'Error al crear cuenta' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.issues },
        { status: 400 }
      );
    }
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido').trim().toLowerCase(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const NESTJS_URL = process.env.NEXT_PUBLIC_NESTJS_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const response = await fetch(`${NESTJS_URL}/auth/log-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al iniciar sesión' }));
      return NextResponse.json(
        { message: error.message || 'Credenciales inválidas' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Set token in cookie for middleware
    const nextResponse = NextResponse.json(data);
    nextResponse.cookies.set('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return nextResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.issues },
        { status: 400 }
      );
    }
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

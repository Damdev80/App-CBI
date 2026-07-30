import { NextResponse } from 'next/server';

const NESTJS_URL = process.env.NEXT_PUBLIC_NESTJS_URL || 'http://localhost:3000';

async function getAuthHeaders(request: Request) {
  const authHeader = request.headers.get('authorization');
  return {
    'Content-Type': 'application/json',
    ...(authHeader ? { Authorization: authHeader } : {}),
  };
}

export async function GET(request: Request) {
  try {
    const headers = await getAuthHeaders(request);

    const response = await fetch(`${NESTJS_URL}/api/profile`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener perfil' }));
      return NextResponse.json(
        { message: error.message || 'No autorizado' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const headers = await getAuthHeaders(request);
    const body = await request.json();

    const response = await fetch(`${NESTJS_URL}/api/profile`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al actualizar perfil' }));
      return NextResponse.json(
        { message: error.message || 'Error al actualizar' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

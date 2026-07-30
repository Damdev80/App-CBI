import { NextResponse } from 'next/server';

const NESTJS_URL = process.env.NEXT_PUBLIC_NESTJS_URL || 'http://localhost:3000';

export async function proxyToNestJS(
  request: Request,
  path: string,
  options: {
    method?: string;
    requireAuth?: boolean;
  } = {}
) {
  const { method = request.method, requireAuth = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
  }

  const init: RequestInit = {
    method,
    headers,
  };

  if (method !== 'GET' && method !== 'HEAD') {
    try {
      const body = await request.clone().text();
      if (body) {
        init.body = body;
      }
    } catch {
      // No body
    }
  }

  // Forward query params
  const url = new URL(request.url);
  const queryString = url.search;

  try {
    const response = await fetch(`${NESTJS_URL}${path}${queryString}`, init);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error del servidor' }));
      return NextResponse.json(error, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/pdf')) {
      const blob = await response.blob();
      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment',
        },
      });
    }

    const data = await response.json().catch(() => null);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Proxy error for ${path}:`, error);
    return NextResponse.json(
      { message: 'Error de conexión con el servidor' },
      { status: 500 }
    );
  }
}

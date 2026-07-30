import { proxyToNestJS } from '@/lib/proxy';

export async function GET(request: Request) {
  return proxyToNestJS(request, '/users-service');
}

export async function POST(request: Request) {
  return proxyToNestJS(request, '/users-service', { method: 'POST' });
}

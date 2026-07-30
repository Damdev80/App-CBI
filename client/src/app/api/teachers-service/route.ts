import { proxyToNestJS } from '@/lib/proxy';

export async function GET(request: Request) {
  return proxyToNestJS(request, '/teachers-service');
}

export async function POST(request: Request) {
  return proxyToNestJS(request, '/teachers-service', { method: 'POST' });
}

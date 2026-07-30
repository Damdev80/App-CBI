import { proxyToNestJS } from '@/lib/proxy';

export async function GET(request: Request) {
  return proxyToNestJS(request, '/users-event');
}

export async function POST(request: Request) {
  return proxyToNestJS(request, '/users-event/create', { method: 'POST' });
}

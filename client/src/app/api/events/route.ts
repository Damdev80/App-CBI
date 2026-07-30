import { proxyToNestJS } from '@/lib/proxy';

export async function GET(request: Request) {
  return proxyToNestJS(request, '/event/events');
}

export async function POST(request: Request) {
  return proxyToNestJS(request, '/event/create', { method: 'POST' });
}

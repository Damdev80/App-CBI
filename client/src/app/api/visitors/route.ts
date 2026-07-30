import { proxyToNestJS } from '@/lib/proxy';

export async function GET(request: Request) {
  return proxyToNestJS(request, '/visitors');
}

export async function POST(request: Request) {
  return proxyToNestJS(request, '/visitors', { method: 'POST' });
}

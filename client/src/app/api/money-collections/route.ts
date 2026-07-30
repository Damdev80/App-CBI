import { proxyToNestJS } from '@/lib/proxy';

export async function GET(request: Request) {
  return proxyToNestJS(request, '/money-collections', { requireAuth: true });
}

export async function POST(request: Request) {
  return proxyToNestJS(request, '/money-collections', { method: 'POST', requireAuth: true });
}

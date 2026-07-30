import { proxyToNestJS } from '@/lib/proxy';

export async function GET(request: Request) {
  return proxyToNestJS(request, '/group/groups');
}

export async function POST(request: Request) {
  return proxyToNestJS(request, '/group/create', { method: 'POST' });
}

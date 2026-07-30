import { proxyToNestJS } from '@/lib/proxy';

export async function GET(request: Request) {
  return proxyToNestJS(request, '/attendance/by-date');
}

export async function POST(request: Request) {
  return proxyToNestJS(request, '/attendance/bulk', { method: 'POST' });
}

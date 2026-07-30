import { proxyToNestJS } from '@/lib/proxy';

export async function POST(request: Request) {
  return proxyToNestJS(request, '/pre-register', { method: 'POST' });
}

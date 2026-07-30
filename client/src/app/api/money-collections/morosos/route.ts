import { proxyToNestJS } from '@/lib/proxy';

export async function GET(request: Request) {
  return proxyToNestJS(request, '/money-collections/morosos', { requireAuth: true });
}

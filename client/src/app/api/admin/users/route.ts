import { proxyToNestJS } from '@/lib/proxy';

export async function GET(request: Request) {
  return proxyToNestJS(request, '/admin/users', { requireAuth: true });
}

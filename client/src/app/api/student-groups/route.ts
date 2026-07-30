import { proxyToNestJS } from '@/lib/proxy';

export async function GET(request: Request) {
  return proxyToNestJS(request, '/student-groups');
}

export async function POST(request: Request) {
  return proxyToNestJS(request, '/student-groups', { method: 'POST' });
}

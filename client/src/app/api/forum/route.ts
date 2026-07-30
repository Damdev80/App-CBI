import { proxyToNestJS } from '@/lib/proxy';

export async function GET(request: Request) {
  return proxyToNestJS(request, '/forum/posts');
}

export async function POST(request: Request) {
  return proxyToNestJS(request, '/forum/posts', { method: 'POST' });
}

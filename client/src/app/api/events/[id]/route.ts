import { proxyToNestJS } from '@/lib/proxy';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  url.searchParams.set('id', id);
  return proxyToNestJS(new Request(url.toString(), request), '/event/events/id');
}

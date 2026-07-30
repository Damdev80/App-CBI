import { proxyToNestJS } from '@/lib/proxy';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToNestJS(request, `/money-collections/${id}/invoice`, { requireAuth: true });
}

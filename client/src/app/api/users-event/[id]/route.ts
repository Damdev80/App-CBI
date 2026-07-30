import { proxyToNestJS } from '@/lib/proxy';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToNestJS(request, `/users-event/${id}`);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToNestJS(request, `/users-event/${id}`, { method: 'PATCH' });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToNestJS(request, `/users-event/${id}`, { method: 'DELETE' });
}

import { NextRequest, NextResponse } from 'next/server';
import { getSchemeById } from '@/lib/services/scheme_service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const scheme = getSchemeById(id);
  if (!scheme) {
    return NextResponse.json({ success: false, message: 'Scheme not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: scheme, message: 'Success' });
}

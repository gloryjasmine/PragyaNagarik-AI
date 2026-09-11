import { NextRequest, NextResponse } from 'next/server';
import { getNavigatorGuide } from '@/lib/services/navigator_service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = getNavigatorGuide(id);
  return NextResponse.json({ success: true, data, message: 'Success' });
}

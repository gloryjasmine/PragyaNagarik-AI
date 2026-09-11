import { NextRequest, NextResponse } from 'next/server';
import { searchSchemes } from '@/lib/services/scheme_service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const government_level = searchParams.get('government_level');
    const state_ut = searchParams.get('state_ut');
    const category = searchParams.get('category');
    const scheme_service_type = searchParams.get('scheme_service_type');

    const data = searchSchemes(q, government_level, state_ut, category, scheme_service_type);
    return NextResponse.json({ success: true, data, message: 'Success' });
  } catch (err: any) {
    console.error('Error in /api/schemes GET handler:', err);
    return NextResponse.json(
      { success: false, error: err?.message || String(err), stack: err?.stack },
      { status: 500 }
    );
  }
}

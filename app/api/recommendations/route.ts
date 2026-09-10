import { NextRequest, NextResponse } from 'next/server';
import { recommendSchemes } from '@/lib/services/recommendation_service';
import { Profile } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const profile: Profile = await request.json();
    const data = recommendSchemes(profile);
    return NextResponse.json({ success: true, data, message: 'Success' });
  } catch {
    const data = recommendSchemes({});
    return NextResponse.json({ success: true, data, message: 'Success' });
  }
}

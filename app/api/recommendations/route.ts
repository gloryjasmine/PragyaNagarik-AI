import { NextRequest, NextResponse } from 'next/server';
import { recommendSchemes } from '@/lib/services/recommendation_service';
import { Profile } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profile: Profile = {
    state: searchParams.get('state') || undefined,
    occupation: searchParams.get('occupation') || undefined,
    gender: searchParams.get('gender') || undefined,
    annual_income: searchParams.get('annual_income') ? Number(searchParams.get('annual_income')) : undefined,
    age: searchParams.get('age') ? Number(searchParams.get('age')) : undefined,
    caste_category: searchParams.get('caste_category') || undefined,
  };
  const data = recommendSchemes(profile);
  return NextResponse.json({ success: true, data, message: 'Success' });
}

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

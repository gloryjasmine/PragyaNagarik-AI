import { NextRequest, NextResponse } from 'next/server';
import { getSchemeById } from '@/lib/services/scheme_service';
import { evaluateEligibility } from '@/lib/services/eligibility_service';
import { Profile } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const scheme = getSchemeById(id);
  if (!scheme) {
    return NextResponse.json({ success: false, message: 'Scheme not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const profile: Profile = {
    state: searchParams.get('state') || undefined,
    occupation: searchParams.get('occupation') || undefined,
    gender: searchParams.get('gender') || undefined,
    annual_income: searchParams.get('annual_income') ? Number(searchParams.get('annual_income')) : undefined,
    age: searchParams.get('age') ? Number(searchParams.get('age')) : undefined,
    caste_category: searchParams.get('caste_category') || undefined,
  };

  const data = evaluateEligibility(scheme, profile);
  return NextResponse.json({ success: true, data, message: 'Success' });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const scheme = getSchemeById(id);
  if (!scheme) {
    return NextResponse.json({ success: false, message: 'Scheme not found' }, { status: 404 });
  }

  let profile: Profile = {};
  try {
    profile = await request.json();
  } catch {
    // default profile
  }

  const data = evaluateEligibility(scheme, profile);
  return NextResponse.json({ success: true, data, message: 'Success' });
}

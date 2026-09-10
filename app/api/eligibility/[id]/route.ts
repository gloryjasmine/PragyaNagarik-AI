import { NextRequest, NextResponse } from 'next/server';
import { getSchemeById } from '@/lib/services/scheme_service';
import { evaluateEligibility } from '@/lib/services/eligibility_service';
import { Profile } from '@/lib/types';

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

import { NextResponse } from 'next/server';
import { getCatalogueFilters } from '@/lib/services/scheme_service';

export async function GET() {
  const data = getCatalogueFilters();
  return NextResponse.json({ success: true, data, message: 'Success' });
}

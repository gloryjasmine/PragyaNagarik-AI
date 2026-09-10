import { NextResponse } from 'next/server';
import { providerManager } from '@/lib/providers/GovernmentDataProviderManager';

export async function GET() {
  const summary = providerManager.getSyncSummary();
  return NextResponse.json({
    success: true,
    data: summary,
    message: 'Government data provider status retrieved successfully',
  });
}

export async function POST() {
  const summary = await providerManager.syncAll();
  return NextResponse.json({
    success: true,
    data: summary,
    message: 'All government data providers synchronized successfully',
  });
}

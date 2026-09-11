import { NextRequest, NextResponse } from 'next/server';
import { answerCopilot } from '@/lib/services/copilot_service';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const message = payload.message || '';
    const profile = payload.profile || {};
    const history = payload.history || [];

    const data = answerCopilot(message, profile, history);
    return NextResponse.json({ success: true, data, message: 'Success' });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error processing copilot request' },
      { status: 500 }
    );
  }
}

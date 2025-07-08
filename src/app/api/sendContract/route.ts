import { NextRequest, NextResponse } from 'next/server';

const COPILOT_API_KEY = process.env.NEXT_PUBLIC_COPILOT_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { recipientId, contractTemplateId } = await req.json();

    // Validate inputs
    if (!recipientId || !contractTemplateId) {
      console.error('🚨 Missing required fields:', { recipientId, contractTemplateId });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('📤 Sending request to Copilot API:', { recipientId, contractTemplateId });

    const response = await fetch('https://api.copilot.app/v1/contracts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'X-API-KEY': COPILOT_API_KEY || '',
      },
      body: JSON.stringify({ recipientId, contractTemplateId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

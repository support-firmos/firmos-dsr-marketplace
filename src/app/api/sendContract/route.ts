import { NextRequest, NextResponse } from 'next/server';

const COPILOT_API_KEY = process.env.COPILOT_API_KEY;

export async function POST(req: NextRequest) {
  const { recipientId, contractTemplateId } = await req.json();

  const url = 'https://api.copilot.com/v1/contracts';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'X-API-KEY': COPILOT_API_KEY || '',
      },
      body: JSON.stringify({ recipientId, contractTemplateId })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
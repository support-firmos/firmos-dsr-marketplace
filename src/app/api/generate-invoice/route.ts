import { NextResponse } from 'next/server';
import { getSession } from '@/utils/session'; // Import the helper function

// Product mapping based on contract name
const productMapping: { [key: string]: string } = {
  '1-Pillar Bizdev': 'FirmOS Growth Platform - Core Focus (1 Pillar) - $2,450',
  '1-Pillar Operations': 'FirmOS Growth Platform - Core Focus (1 Pillar) - $2,450',
  '1-Pillar Talent': 'FirmOS Growth Platform - Core Focus (1 Pillar) - $2,450',
  '2-Pillar Bizdev-Talent': 'FirmOS Business Accelerator (2 Pillars) - $3,450 (30% Savings)',
  '2-Pillar Talent-Ops': 'FirmOS Business Accelerator (2 Pillars) - $3,450 (30% Savings)',
  '2-Pillar Bizdev-Ops': 'FirmOS Business Accelerator (2 Pillars) - $3,450 (30% Savings)',
  '3-Pillars': 'FirmOS Total Business Mastery (3 Pillars) - $4,450 (40% Savings)',
  'Consulting Services': 'FirmOS Consulting Subscription - $750/month',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data?.name) {
      return NextResponse.json(
        { error: 'Missing required parameter: contract name (data.name)' },
        { status: 400 }
      );
    }

    const contractName = data.name;
    const productName = productMapping[contractName];

    if (!productName) {
      return NextResponse.json(
        { error: 'Invalid contract name, no matching product found' },
        { status: 400 }
      );
    }

    // Retrieve session data from search params
    const searchParams = new URL(request.url).searchParams;
    const sessionData = await getSession(searchParams);

    // Extract client name or company name from session data
    let clientName: string | null = null;

    if (sessionData.client) {
      clientName = `${sessionData.client.givenName} ${sessionData.client.familyName}`;
    } else if (sessionData.company) {
      clientName = sessionData.company.name;
    }

    // If no client name is found, return an error
    if (!clientName) {
      return NextResponse.json(
        { error: 'Client name could not be determined from session data' },
        { status: 500 }
      );
    }

    // Prepare the invoice generation API call
    const BASE_URL = 'https://firmos-copilot-autoinvoice-899783477192.us-central1.run.app/generate_invoice';
    const fullUrl = `${BASE_URL}?client_name=${encodeURIComponent(clientName)}&product_name=${encodeURIComponent(productName)}`;

    console.log('🔗 Requesting URL:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Invoice generation failed: ${response.statusText}`);
    }

    const invoiceData = await response.json();
    console.log('📤 Invoice successfully generated:', invoiceData);

    return NextResponse.json(invoiceData, { status: 200 });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process the webhook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

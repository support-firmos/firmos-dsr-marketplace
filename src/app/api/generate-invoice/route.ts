import { NextResponse } from 'next/server';

// Product mapping for contract names
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

// Function to fetch client details from Copilot API
async function getClientDetails(clientId: string): Promise<{ fullName: string }> {
  const COPILOT_API_KEY = process.env.NEXT_PUBLIC_COPILOT_API_KEY;

  if (!COPILOT_API_KEY) {
    throw new Error('Copilot API key is not configured');
  }

  const url = `https://api.copilot.com/v1/clients/${clientId}`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${COPILOT_API_KEY}`,
    },
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Failed to fetch client details: ${response.statusText}`);
  }

  const clientData = await response.json();
  const fullName = `${clientData.givenName} ${clientData.familyName}`;

  return { fullName };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, recipientId } = body;

    if (!data?.name) {
      return NextResponse.json(
        { error: 'Missing required parameter: contract name (data.name)' },
        { status: 400 }
      );
    }

    if (!recipientId) {
      return NextResponse.json(
        { error: 'Missing required parameter: recipientId' },
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

    // Fetch client details from Copilot API
    const { fullName: clientName } = await getClientDetails(recipientId);

    // Prepare the invoice generation API call
    const BASE_URL = 'https://firmos-copilot-autoinvoice-899783477192.us-central1.run.app/generate_invoice';
    const fullUrl = `${BASE_URL}?client_name=${encodeURIComponent(clientName)}&product_name=${encodeURIComponent(productName)}`;

    console.log('🔗 Requesting URL:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
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

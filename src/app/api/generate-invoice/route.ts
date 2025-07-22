import { NextResponse } from 'next/server';

const BASE_URL = 'https://firmos-copilot-autoinvoice-service-899783477192.us-central1.run.app/generate';
const TIMEOUT_MS = 120000; // Timeout set to 120 seconds

// Function to fetch client details
async function getClientDetails(clientId: string): Promise<{ fullName: string }> {
  const url = `https://api.copilot.app/v1/clients/${clientId}`;

  // Prepare headers
  const headers: Record<string, string> = {
    accept: 'application/json',
  };

  const apiKey = process.env.NEXT_PUBLIC_COPILOT_API_KEY;
  if (apiKey) {
    headers['X-API-KEY'] = apiKey; // Add the API key only if it exists
  }

  const options = {
    method: 'GET',
    headers, // Use the dynamically built headers object
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Failed to fetch client details: ${errorDetails}`);
  }

  const clientData = await response.json();
  return {
    fullName: `${clientData.givenName} ${clientData.familyName}`,
  };
}

// Main route handler
export async function POST(request: Request) {
  try {
    const { data } = await request.json();

    // Validate required fields
    if (!data?.name) {
      return NextResponse.json(
        { error: 'Missing required parameter: contract name (data.name)' },
        { status: 400 }
      );
    }
    if (!data?.recipientId) {
      return NextResponse.json(
        { error: 'Missing required parameter: recipientId' },
        { status: 400 }
      );
    }

    const contractName = data.name;
    const recipientId = data.recipientId;

    // Fetch client details
    const { fullName: clientName } = await getClientDetails(recipientId);
    console.log('👤 Client name resolved:', clientName);

    // Map contract name to product name
    const productMapping: { [key: string]: string } = {
      '1-Pillar Bizdev': '[TEST] Product',
      '1-Pillar Operations': '[TEST] Product',
      '1-Pillar Talent': '[TEST] Product',
      '2-Pillar Bizdev-Talent': 'FirmOS Business Accelerator (2 Pillars) - $3,450 (30% Savings)',
      '2-Pillar Talent-Ops': 'FirmOS Business Accelerator (2 Pillars) - $3,450 (30% Savings)',
      '2-Pillar Bizdev-Ops': 'FirmOS Business Accelerator (2 Pillars) - $3,450 (30% Savings)',
      '3-Pillars': 'FirmOS Total Business Mastery (3 Pillars) - $4,450 (40% Savings)',
      'Consulting Services': 'FirmOS Consulting Subscription - $750/month',
    };

    const productName = productMapping[contractName];
    if (!productName) {
      return NextResponse.json(
        { error: `Unknown contract name: ${contractName}` },
        { status: 400 }
      );
    }
    console.log('📦 Product name mapped:', productName);

    // Generate invoice
    const fullUrl = `${BASE_URL}?client_name=${encodeURIComponent(clientName)}&product_name=${encodeURIComponent(
      productName
    )}`;
    console.log('🔗 Invoice generation URL:', fullUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Invoice generation failed: ${errorDetails}`);
    }

    const invoiceResponse = await response.json();
    console.log('📥 Invoice API Response:', invoiceResponse);

    // Return the invoice response
    return NextResponse.json(invoiceResponse, { status: 200 });
  } catch (error) {
    console.error('❌ Error:', error);

    // Return a detailed error response
    return NextResponse.json(
      {
        error: 'Failed to process the webhook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// src/app/api/contracts/route.ts
import { copilotApi } from 'copilot-node-sdk';
import { NextResponse } from 'next/server';
import { need } from '@/utils/need';

export async function POST(request: Request) {
  try {
    // Get request body
    const body = await request.json();
    const { contractTemplateId, recipientId } = body;

    // Validate required fields
    if (!contractTemplateId) {
      return NextResponse.json(
        { error: 'Contract template ID is required' },
        { status: 400 }
      );
    }

    if (!recipientId) {
      return NextResponse.json(
        { error: 'Recipient ID is required' },
        { status: 400 }
      );
    }

    // Get API key using the need utility
    const apiKey = need<string>(
      process.env.COPILOT_API_KEY,
      'COPILOT_API_KEY is required'
    );

    // Initialize Copilot SDK
    const copilot = copilotApi({
      apiKey,
    });

    // Send contract using Copilot API
    const contract = await copilot.sendContract({
      requestBody: {
        contractTemplateId: contractTemplateId,
        recipientId: recipientId,
      }
    });

    // Return success response with contract data
    return NextResponse.json({
      success: true,
      contractId: contract.id,
    });

  } catch (error) {
    console.error('Contract creation error:', error);
    
    // Return detailed error for debugging
    return NextResponse.json(
      {
        error: 'Failed to create contract',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
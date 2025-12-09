import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, unauthorizedResponse } from '@/lib/auth/api-auth';
import { prisma } from '@/lib/prisma';
import { corsHeaders, handleCorsPreflightRequest } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}

// GET /api/v1/decks - List user's decks
export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);

  if (!authResult.success) {
    return unauthorizedResponse(authResult.error);
  }

  const decks = await prisma.deck.findMany({
    where: { createdBy: authResult.user.userId },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ decks }, { headers: corsHeaders(request) });
}

// POST /api/v1/decks - Create deck
export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);

  if (!authResult.success) {
    return unauthorizedResponse(authResult.error);
  }

  const body = await request.json();
  const { name, description } = body;

  const deck = await prisma.deck.create({
    data: {
      name,
      description,
      createdBy: authResult.user.userId,
    },
  });

  return NextResponse.json({ deck }, { status: 201, headers: corsHeaders(request) });
}

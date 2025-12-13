import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, unauthorizedResponse } from '@/lib/auth/api-auth';
import { prisma } from '@/lib/prisma';
import { corsHeaders, handleCorsPreflightRequest } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);

  if (!authResult.success) {
    return unauthorizedResponse(authResult.error);
  }

  const user = await prisma.user.findUnique({
    where: { id: authResult.user.userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) {
    return unauthorizedResponse('User not found');
  }

  // Check if user is an admin by looking up in Admin table
  const admin = await prisma.admin.findUnique({
    where: { email: user.email },
  });

  return NextResponse.json(
    {
      user: {
        ...user,
        role: admin ? 'ADMIN' : 'USER',
      },
    },
    { headers: corsHeaders(request) }
  );
}

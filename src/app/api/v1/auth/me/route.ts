import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, unauthorizedResponse } from '@/lib/auth/api-auth';
import { prisma } from '@/lib/prisma';

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
      isAdmin: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) {
    return unauthorizedResponse('User not found');
  }

  return NextResponse.json({
    user: {
      ...user,
      role: user.isAdmin ? 'ADMIN' : 'USER',
    },
  });
}

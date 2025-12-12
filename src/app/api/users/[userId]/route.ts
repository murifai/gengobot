import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { recordTrialStart } from '@/lib/subscription/trial-history-service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const body = await request.json();
    const { name, proficiency, fullName, nickname, domicile, institution } = body;

    // Ensure user can only update their own profile
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!dbUser || dbUser.email !== sessionUser.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build update data object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (proficiency !== undefined) updateData.proficiency = proficiency;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (domicile !== undefined) updateData.domicile = domicile;
    if (institution !== undefined) updateData.institution = institution;

    // Update user
    // Note: After running `npx prisma migrate dev` and `npx prisma generate`,
    // the new fields (fullName, nickname, domicile, institution, subscriptionPlan) will be available
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Cast to extended type until Prisma client is regenerated
    const userWithNewFields = updatedUser as typeof updatedUser & {
      fullName?: string | null;
      nickname?: string | null;
      domicile?: string | null;
      institution?: string | null;
      subscriptionPlan?: string;
    };

    return NextResponse.json({
      id: userWithNewFields.id,
      name: userWithNewFields.name,
      email: userWithNewFields.email,
      image: userWithNewFields.image,
      proficiency: userWithNewFields.proficiency,
      fullName: userWithNewFields.fullName ?? null,
      nickname: userWithNewFields.nickname ?? null,
      domicile: userWithNewFields.domicile ?? null,
      institution: userWithNewFields.institution ?? null,
      subscriptionPlan: userWithNewFields.subscriptionPlan ?? 'free',
      preferredTaskCategories: userWithNewFields.preferredTaskCategories,
      createdAt: userWithNewFields.createdAt,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        proficiency: true,
        preferredTaskCategories: true,
        completedTasks: true,
        currentTaskId: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only allow users to view their own profile or admins
    if (!sessionUser.isAdmin && dbUser.email !== sessionUser.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    // Ensure user can only delete their own account
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        subscription: {
          select: {
            tier: true,
            trialStartDate: true,
          },
        },
      },
    });

    if (!dbUser || dbUser.email !== sessionUser.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Record trial history BEFORE deleting user (prevents re-registering for new trial)
    // This ensures the email is recorded even if user deletes account
    if (dbUser.subscription?.trialStartDate) {
      await recordTrialStart(userId, dbUser.email);
    }

    // Delete user and all related data
    // Prisma will cascade delete related records based on schema
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}

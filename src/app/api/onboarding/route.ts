import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      userId,
      nickname,
      domicile,
      institution,
      ageRange,
      gender,
      learningDuration,
      currentLevel,
      learningGoals,
      learningGoalsOther,
      usageOpportunities,
      usageOpportunitiesOther,
      hasAppExperience,
      previousApps,
      conversationPracticeExp,
      appOpinion,
      hasLivedInJapan,
      japanStayDuration,
      subscriptionPlan,
    } = body;

    // Combine goals with "other" text if provided
    const finalLearningGoals =
      learningGoals.includes('Lainnya') && learningGoalsOther
        ? [
            ...learningGoals.filter((g: string) => g !== 'Lainnya'),
            `Lainnya: ${learningGoalsOther}`,
          ]
        : learningGoals;

    const finalUsageOpportunities =
      usageOpportunities.includes('Lainnya') && usageOpportunitiesOther
        ? [
            ...usageOpportunities.filter((u: string) => u !== 'Lainnya'),
            `Lainnya: ${usageOpportunitiesOther}`,
          ]
        : usageOpportunities;

    // Verify that the user is updating their own data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update user with onboarding data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        nickname,
        domicile,
        institution,
        ageRange,
        gender,
        learningDuration,
        proficiency: currentLevel === 'unknown' ? 'N5' : currentLevel,
        learningGoals: finalLearningGoals,
        japaneseUsageOpportunities: finalUsageOpportunities,
        hasAppExperience,
        previousApps,
        conversationPracticeExp,
        appOpinion,
        hasLivedInJapan,
        japanStayDuration,
        subscriptionPlan: subscriptionPlan || 'free',
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        onboardingCompleted: updatedUser.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Failed to save onboarding data' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin-auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all user analytics data
    const [
      usersByProficiency,
      usersByAgeRange,
      usersByGender,
      usersByDomicile,
      usersByInstitution,
      usersByLearningDuration,
      usersByHasLivedInJapan,
      usersByJapanStayDuration,
      detailedUsers,
    ] = await Promise.all([
      // Users by proficiency level
      prisma.user.groupBy({
        by: ['proficiency'],
        _count: { id: true },
      }),

      // Users by age range
      prisma.user.groupBy({
        by: ['ageRange'],
        _count: { id: true },
        where: { ageRange: { not: null } },
      }),

      // Users by gender
      prisma.user.groupBy({
        by: ['gender'],
        _count: { id: true },
        where: { gender: { not: null } },
      }),

      // Users by domicile (top 20)
      prisma.user.groupBy({
        by: ['domicile'],
        _count: { id: true },
        where: { domicile: { not: null } },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
      }),

      // Users by institution (top 20)
      prisma.user.groupBy({
        by: ['institution'],
        _count: { id: true },
        where: { institution: { not: null } },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
      }),

      // Users by learning duration
      prisma.user.groupBy({
        by: ['learningDuration'],
        _count: { id: true },
        where: { learningDuration: { not: null } },
      }),

      // Users who have lived in Japan
      prisma.user.groupBy({
        by: ['hasLivedInJapan'],
        _count: { id: true },
        where: { hasLivedInJapan: { not: null } },
      }),

      // Users by Japan stay duration
      prisma.user.groupBy({
        by: ['japanStayDuration'],
        _count: { id: true },
        where: { japanStayDuration: { not: null } },
      }),

      // Detailed user list for table
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          proficiency: true,
          ageRange: true,
          gender: true,
          domicile: true,
          institution: true,
          learningDuration: true,
          subscriptionPlan: true,
          hasLivedInJapan: true,
          japanStayDuration: true,
          createdAt: true,
          updatedAt: true,
          subscription: {
            select: {
              tier: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 1000, // Limit for performance
      }),
    ]);

    // Transform data for charts
    const transformGroupBy = (
      data: Array<{ _count: { id: number }; [key: string]: unknown }>,
      key: string
    ) => {
      return data.map(item => ({
        label: String(item[key] || 'Unknown'),
        count: item._count.id,
      }));
    };

    return NextResponse.json({
      demographics: {
        byProficiency: transformGroupBy(usersByProficiency, 'proficiency'),
        byAgeRange: transformGroupBy(usersByAgeRange, 'ageRange'),
        byGender: transformGroupBy(usersByGender, 'gender'),
        byDomicile: transformGroupBy(usersByDomicile, 'domicile'),
        byInstitution: transformGroupBy(usersByInstitution, 'institution'),
      },
      learningProfile: {
        byLearningDuration: transformGroupBy(usersByLearningDuration, 'learningDuration'),
      },
      japanExperience: {
        hasLivedInJapan: transformGroupBy(usersByHasLivedInJapan, 'hasLivedInJapan'),
        byStayDuration: transformGroupBy(usersByJapanStayDuration, 'japanStayDuration'),
      },
      users: detailedUsers.map(user => ({
        ...user,
        subscriptionTier: user.subscription?.tier || 'FREE',
        subscriptionStatus: user.subscription?.status || 'ACTIVE',
      })),
    });
  } catch (error) {
    console.error('User analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch user analytics' }, { status: 500 });
  }
}

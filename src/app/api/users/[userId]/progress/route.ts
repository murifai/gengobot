import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Verify user can access this data
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, isAdmin: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const requestingUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { isAdmin: true, email: true },
    })

    if (!requestingUser?.isAdmin && dbUser.email !== user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get task attempts statistics
    const attempts = await prisma.taskAttempt.findMany({
      where: { userId },
      include: {
        task: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    })

    const completedAttempts = attempts.filter((a) => a.isCompleted)
    const totalAttempts = attempts.length
    const completedTasks = completedAttempts.length

    // Calculate average score
    const scoresSum = completedAttempts.reduce(
      (sum, attempt) => sum + (attempt.overallScore || 0),
      0
    )
    const averageScore =
      completedAttempts.length > 0 ? scoresSum / completedAttempts.length : 0

    // Get recent attempts (last 10)
    const recentAttempts = completedAttempts.slice(0, 10).map((attempt) => ({
      id: attempt.id,
      taskTitle: attempt.task.title,
      overallScore: attempt.overallScore || 0,
      completedAt: attempt.endTime?.toISOString() || attempt.startTime.toISOString(),
    }))

    return NextResponse.json({
      totalAttempts,
      completedTasks,
      averageScore,
      recentAttempts,
    })
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

/**
 * Debug endpoint to check task attempts
 * GET /api/debug/task-attempts
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const attempts = await prisma.taskAttempt.findMany({
      take: 10,
      orderBy: {
        startTime: 'desc',
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const formatted = attempts.map((attempt) => {
      const conversationHistory = attempt.conversationHistory as {
        messages?: unknown[];
      };

      return {
        id: attempt.id,
        taskTitle: attempt.task.title,
        userName: attempt.user.name || attempt.user.email,
        messageCount: conversationHistory?.messages?.length || 0,
        isCompleted: attempt.isCompleted,
        startTime: attempt.startTime,
      };
    });

    return NextResponse.json({
      total: attempts.length,
      attempts: formatted,
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch attempts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

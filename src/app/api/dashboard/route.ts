import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { creditService } from '@/lib/subscription/credit-service';

export const dynamic = 'force-dynamic';

// Japanese greetings by time of day
const GREETINGS = {
  morning: [
    'おはよう！',
    'おはよー!',
    'おはよーごし!',
    'おはよがんす!',
    'はやえなっす！',
    'おはよさん！',
    'おはよーごいす！',
    'おはよーござんす！',
    'いあんばいです！',
    'はやいなも！',
    'はやいなー！',
    'おはよーがんす！',
    'おはよーごぁんす！',
    'おはよーがーす！',
    'おはよーござんした！',
    'おはよーござるます！',
    'こんちゃらごあす！',
    'っうきみそーちー！',
  ],
  afternoon: [
    'こんにちは！',
    'なじら！',
    'だんだんどうも！',
    'まいどはや！',
    'まいどさん！',
    'いあんばい！',
    'こんちくわー！',
    'こんちわー！',
    'こんちは！',
    'こんちゃら！',
    'はいさい！',
  ],
  evening: [
    'おばんです！',
    'ばんげなったの！',
    'おばんかだです！',
    'こんばんは！',
    'おばんなりました！',
    'おしまいやす！',
    'ばんなりました！',
    'ばんじました！',
    'しめなったか！',
    'ちゃーびらさい！',
    'めっかりもうさん！',
    'もーしまいなったか！',
    'おしまいな！',
    'ばんじまして！',
    'ばんになりました！',
    'おつかれなって！',
  ],
};

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  // Use Asia/Jakarta timezone (WIB - UTC+7)
  const now = new Date();
  const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
  const hour = jakartaTime.getHours();

  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  return 'evening';
}

function getRandomGreeting(): { greeting: string; timeOfDay: 'morning' | 'afternoon' | 'evening' } {
  const timeOfDay = getTimeOfDay();
  const greetings = GREETINGS[timeOfDay];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  return { greeting, timeOfDay };
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user profile with nickname
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        nickname: true,
        fullName: true,
        image: true,
        proficiency: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get subscription and credit balance
    const subscription = await creditService.getOrCreateSubscription(userId);
    const balance = await creditService.getBalance(userId);

    // Get last activity for continue feature
    const [inProgressDeckSession, lastDeckSession, lastTaskAttempt, lastFreeConversation] =
      await Promise.all([
        // First priority: in-progress deck drill session
        prisma.studySession.findFirst({
          where: {
            userId,
            isCompleted: false,
          },
          orderBy: { startTime: 'desc' },
          include: {
            deck: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        // Second priority: last completed deck drill session
        prisma.studySession.findFirst({
          where: {
            userId,
            isCompleted: true,
          },
          orderBy: { startTime: 'desc' },
          include: {
            deck: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        // Last roleplay task attempt (in progress or completed)
        prisma.taskAttempt.findFirst({
          where: {
            userId,
          },
          orderBy: { startTime: 'desc' },
          include: {
            task: {
              select: {
                id: true,
                title: true,
                difficulty: true,
              },
            },
          },
        }),
        // Last free conversation
        prisma.freeConversation.findFirst({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          include: {
            character: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
      ]);

    // Generate greeting
    const { greeting, timeOfDay } = getRandomGreeting();
    const displayName = user.nickname || user.fullName || user.name || 'Learner';

    return NextResponse.json({
      user: {
        id: user.id,
        displayName,
        nickname: user.nickname,
        fullName: user.fullName,
        name: user.name,
        image: user.image,
        proficiency: user.proficiency,
      },
      greeting: {
        text: greeting,
        timeOfDay,
      },
      subscription: subscription
        ? {
            tier: subscription.tier,
            status: subscription.status,
            periodEnd: subscription.currentPeriodEnd,
          }
        : null,
      credits: balance
        ? {
            total: balance.total,
            used: balance.used,
            remaining: balance.remaining,
            isTrialActive: balance.isTrialActive,
            trialDaysRemaining: balance.trialDaysRemaining,
            trialDailyUsed: balance.trialDailyUsed,
            trialDailyLimit: balance.trialDailyLimit,
          }
        : null,
      lastActivity: {
        // Prefer in-progress session, fall back to last completed
        deck: inProgressDeckSession
          ? {
              deckId: inProgressDeckSession.deck.id,
              deckName: inProgressDeckSession.deck.name,
              lastStudied: inProgressDeckSession.startTime,
              isInProgress: true,
              currentCardIndex: inProgressDeckSession.currentCardIndex,
              cardsReviewed: inProgressDeckSession.cardsReviewed,
            }
          : lastDeckSession
            ? {
                deckId: lastDeckSession.deck.id,
                deckName: lastDeckSession.deck.name,
                lastStudied: lastDeckSession.startTime,
                isInProgress: false,
              }
            : null,
        roleplay: lastTaskAttempt
          ? {
              attemptId: lastTaskAttempt.id,
              taskId: lastTaskAttempt.task.id,
              taskTitle: lastTaskAttempt.task.title,
              isCompleted: lastTaskAttempt.isCompleted,
              lastActive: lastTaskAttempt.endTime || lastTaskAttempt.startTime,
            }
          : null,
        freeChat: lastFreeConversation
          ? {
              sessionId: lastFreeConversation.id,
              characterId: lastFreeConversation.character?.id,
              characterName: lastFreeConversation.character?.name,
              lastActive: lastFreeConversation.updatedAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

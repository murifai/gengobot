'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, BookOpen, Target } from 'lucide-react';

interface TaskStat {
  taskId: string;
  taskTitle: string;
  category: string;
  difficulty: string;
  totalAttempts: number;
  completions: number;
  completionRate: string;
  avgDuration: number;
  avgScore: string;
}

interface DeckStat {
  deckId: string;
  deckName: string;
  creatorType: string;
  isPublic: boolean;
  cardCount: number;
  studySessions: number;
}

interface PracticeStatsTabProps {
  roleplay: {
    tasks: TaskStat[];
    summary: {
      totalTasks: number;
      totalAttempts: number;
      completedAttempts: number;
      completionRate: string;
    };
  };
  freeChat: {
    totalConversations: number;
    avgMessages: string;
  };
  decks: {
    all: DeckStat[];
    admin: DeckStat[];
    user: DeckStat[];
    summary: {
      totalDecks: number;
      adminDecks: number;
      userDecks: number;
      totalSessions: number;
    };
  };
}

const DIFFICULTY_COLORS: Record<string, string> = {
  N5: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  N4: 'bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300',
  N3: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  N2: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  N1: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export function PracticeStatsTab({ roleplay, freeChat, decks }: PracticeStatsTabProps) {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleplay.summary.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {roleplay.summary.totalAttempts.toLocaleString()} attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-tertiary-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleplay.summary.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {roleplay.summary.completedAttempts.toLocaleString()} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Chat</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{freeChat.totalConversations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Avg {freeChat.avgMessages} messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Decks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decks.summary.totalDecks}</div>
            <p className="text-xs text-muted-foreground">
              {decks.summary.totalSessions.toLocaleString()} sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Task statistics table */}
      <Card>
        <CardHeader>
          <CardTitle>Roleplay Tasks Performance</CardTitle>
          <CardDescription>Statistics for each roleplay task</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Task</th>
                  <th className="text-left p-2 font-medium">Category</th>
                  <th className="text-center p-2 font-medium">Level</th>
                  <th className="text-right p-2 font-medium">Attempts</th>
                  <th className="text-right p-2 font-medium">Completions</th>
                  <th className="text-right p-2 font-medium">Rate</th>
                  <th className="text-right p-2 font-medium">Avg Time</th>
                  <th className="text-right p-2 font-medium">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {roleplay.tasks.slice(0, 20).map(task => (
                  <tr key={task.taskId} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <span className="font-medium">{task.taskTitle}</span>
                    </td>
                    <td className="p-2 text-muted-foreground">{task.category}</td>
                    <td className="p-2 text-center">
                      <Badge
                        variant="secondary"
                        className={DIFFICULTY_COLORS[task.difficulty] || ''}
                      >
                        {task.difficulty}
                      </Badge>
                    </td>
                    <td className="p-2 text-right">{task.totalAttempts.toLocaleString()}</td>
                    <td className="p-2 text-right">{task.completions.toLocaleString()}</td>
                    <td className="p-2 text-right">{task.completionRate}%</td>
                    <td className="p-2 text-right">{task.avgDuration}m</td>
                    <td className="p-2 text-right">{task.avgScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {roleplay.tasks.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No task data available</p>
          )}
        </CardContent>
      </Card>

      {/* Deck statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Deck Statistics</CardTitle>
          <CardDescription>
            {decks.summary.adminDecks} admin decks, {decks.summary.userDecks} user decks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({decks.all.length})</TabsTrigger>
              <TabsTrigger value="admin">Admin ({decks.admin.length})</TabsTrigger>
              <TabsTrigger value="user">User ({decks.user.length})</TabsTrigger>
            </TabsList>

            {['all', 'admin', 'user'].map(tabKey => {
              const deckList =
                tabKey === 'all' ? decks.all : tabKey === 'admin' ? decks.admin : decks.user;
              return (
                <TabsContent key={tabKey} value={tabKey}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Deck Name</th>
                          <th className="text-center p-2 font-medium">Type</th>
                          <th className="text-right p-2 font-medium">Cards</th>
                          <th className="text-right p-2 font-medium">Sessions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deckList.slice(0, 20).map(deck => (
                          <tr key={deck.deckId} className="border-b hover:bg-muted/50">
                            <td className="p-2">
                              <span className="font-medium">{deck.deckName}</span>
                            </td>
                            <td className="p-2 text-center">
                              <Badge
                                variant={deck.creatorType === 'Admin' ? 'default' : 'secondary'}
                              >
                                {deck.creatorType}
                              </Badge>
                            </td>
                            <td className="p-2 text-right">{deck.cardCount}</td>
                            <td className="p-2 text-right">
                              {deck.studySessions.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {deckList.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No deck data available</p>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { CheckCircle2, XCircle, Clock, TrendingUp, ArrowLeft, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionScore {
  sectionType: string;
  normalizedScore: number;
  rawScore: number;
  referenceGrade: 'A' | 'B' | 'C';
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
}

interface Answer {
  questionId: string;
  mondaiNumber: number;
  questionNumber: number;
  questionText: string;
  selectedAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string | null;
  passage: { id: string; title: string | null; content: string } | null;
  answerChoices: Array<{ choiceNumber: number; choiceText: string }>;
}

interface QuestionReview {
  sectionType: string;
  answers: Answer[];
}

interface TestResults {
  attempt: {
    id: string;
    level: string;
    status: string;
    startedAt: string;
    completedAt: string;
    totalScore: number;
    passed: boolean;
  };
  sectionScores: SectionScore[];
  timeTracking: {
    totalSeconds: number;
    bySection: Array<{
      sectionType: string;
      timeSpentSeconds: number;
      submittedAt: string;
    }>;
  };
  questionReview: QuestionReview[];
}

const SECTION_NAMES: Record<string, string> = {
  vocabulary: '言語知識（文字・語彙）',
  grammar_reading: '言語知識（文法）・読解',
  listening: '聴解',
};

const GRADE_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  B: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  C: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
};

// Group answers by mondai
const groupByMondai = (answers: Answer[]) => {
  const grouped = new Map<number, Answer[]>();

  answers.forEach(answer => {
    if (!grouped.has(answer.mondaiNumber)) {
      grouped.set(answer.mondaiNumber, []);
    }
    grouped.get(answer.mondaiNumber)!.push(answer);
  });

  // Sort questions within each mondai by questionNumber
  grouped.forEach((questions, mondaiNumber) => {
    grouped.set(
      mondaiNumber,
      questions.sort((a, b) => a.questionNumber - b.questionNumber)
    );
  });

  return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);
};

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params?.attemptId as string;

  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('vocabulary');

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jlpt/tryout/results/${attemptId}`);

      if (!response.ok) {
        throw new Error('結果の取得に失敗しました');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}時間${minutes}分${secs}秒`;
    }
    return `${minutes}分${secs}秒`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">結果を読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">エラー</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error || '結果が見つかりませんでした'}</p>
            <Button onClick={() => router.push('/jlpt/tryout')}>戻る</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSectionReview = results.questionReview.find(
    review => review.sectionType === selectedSection
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/jlpt/tryout')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          模試一覧へ戻る
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          PDFダウンロード
        </Button>
      </div>

      {/* Overall Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">JLPT {results.attempt.level} 模試結果</CardTitle>
              <CardDescription className="mt-2">
                完了日時: {new Date(results.attempt.completedAt).toLocaleString('ja-JP')}
              </CardDescription>
            </div>
            <Badge
              className={cn(
                'text-lg px-6 py-2',
                results.attempt.passed
                  ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
                  : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'
              )}
              variant="outline"
            >
              {results.attempt.passed ? '合格' : '不合格'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Score */}
          <div className="text-center py-6 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">総合得点</p>
            <p className="text-5xl font-bold">{results.attempt.totalScore}</p>
            <p className="text-sm text-muted-foreground mt-1">/ 180点</p>
          </div>

          {/* Section Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.sectionScores.map(score => (
              <Card key={score.sectionType} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {SECTION_NAMES[score.sectionType]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{score.normalizedScore}</p>
                    <p className="text-xs text-muted-foreground">/ 60点</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">正解率</span>
                    <span className="font-semibold">{score.accuracy}%</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">正解数</span>
                    <span className="font-semibold">
                      {score.correctAnswers} / {score.totalQuestions}
                    </span>
                  </div>

                  <Badge
                    className={cn('w-full justify-center', GRADE_COLORS[score.referenceGrade])}
                    variant="outline"
                  >
                    参考評価: {score.referenceGrade}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Time Statistics */}
          <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                所要時間
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">合計</p>
                  <p className="font-semibold">{formatTime(results.timeTracking.totalSeconds)}</p>
                </div>
                {results.timeTracking.bySection.map(section => (
                  <div key={section.sectionType}>
                    <p className="text-muted-foreground mb-1 truncate">
                      {SECTION_NAMES[section.sectionType]}
                    </p>
                    <p className="font-semibold">{formatTime(section.timeSpentSeconds)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            解答一覧
          </CardTitle>
          <CardDescription>各問題の正誤と解説を確認できます</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedSection} onValueChange={setSelectedSection}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vocabulary">言語知識</TabsTrigger>
              <TabsTrigger value="grammar_reading">文法・読解</TabsTrigger>
              <TabsTrigger value="listening">聴解</TabsTrigger>
            </TabsList>

            {currentSectionReview && (
              <TabsContent value={selectedSection} className="mt-6">
                <Accordion type="multiple" className="space-y-2">
                  {groupByMondai(currentSectionReview.answers).map(([mondaiNumber, mondaiAnswers]) => {
                    const correctCount = mondaiAnswers.filter(a => a.isCorrect).length;
                    const totalCount = mondaiAnswers.length;
                    const accuracy = Math.round((correctCount / totalCount) * 100);

                    return (
                      <AccordionItem
                        key={mondaiNumber}
                        value={`mondai-${mondaiNumber}`}
                        className="border rounded-lg px-4 bg-card"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 w-full">
                            <h3 className="text-lg font-bold">問題 {mondaiNumber}</h3>
                            <Badge variant="outline" className="text-sm">
                              {mondaiAnswers.length}問
                            </Badge>
                            <div className="flex items-center gap-2 ml-auto mr-4">
                              <span className="text-sm text-muted-foreground">
                                正解率: {accuracy}%
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-sm',
                                  accuracy >= 80
                                    ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300'
                                    : accuracy >= 60
                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300'
                                )}
                              >
                                {correctCount}/{totalCount}
                              </Badge>
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent>
                          <div className="space-y-4 pt-4">
                            {mondaiAnswers.map((answer, index) => (
                        <Card
                          key={answer.questionId}
                          className={cn(
                            'border-2',
                            answer.isCorrect
                              ? 'border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-950/20'
                              : 'border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/20'
                          )}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-base">
                                第{index + 1}問
                              </CardTitle>
                              {answer.isCorrect ? (
                                <Badge
                                  className="bg-green-100 text-green-800 border-green-300 gap-1 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                                  variant="outline"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  正解
                                </Badge>
                              ) : (
                                <Badge
                                  className="bg-red-100 text-red-800 border-red-300 gap-1 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                                  variant="outline"
                                >
                                  <XCircle className="h-3 w-3" />
                                  不正解
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Passage if exists */}
                            {answer.passage && (
                              <div className="bg-card p-4 rounded-lg border">
                                {answer.passage.title && (
                                  <p className="font-semibold mb-2">{answer.passage.title}</p>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{answer.passage.content}</p>
                              </div>
                            )}

                            {/* Question */}
                            <div>
                              <p className="font-medium mb-3">{answer.questionText}</p>

                              {/* Answer Choices */}
                              <div className="space-y-2">
                                {answer.answerChoices.map(choice => {
                                  const isCorrect = choice.choiceNumber === answer.correctAnswer;
                                  const isSelected = choice.choiceNumber === answer.selectedAnswer;
                                  const isWrong = isSelected && !isCorrect;

                                  return (
                                    <div
                                      key={choice.choiceNumber}
                                      className={cn(
                                        'p-3 rounded-lg border-2 flex items-start gap-2 transition-colors',
                                        isCorrect &&
                                          'border-green-500 bg-green-50 dark:border-green-700 dark:bg-green-950/30',
                                        isWrong &&
                                          'border-red-500 bg-red-50 dark:border-red-700 dark:bg-red-950/30',
                                        !isCorrect && !isWrong && 'border-border bg-card'
                                      )}
                                    >
                                      <span className="font-semibold min-w-[24px]">
                                        {choice.choiceNumber}.
                                      </span>
                                      <span className="flex-1">{choice.choiceText}</span>
                                      {isCorrect && (
                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                      )}
                                      {isWrong && (
                                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Explanation */}
                            {answer.explanation && (
                              <>
                                <Separator />
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                                    解説
                                  </p>
                                  <p className="text-sm whitespace-pre-wrap">
                                    {answer.explanation}
                                  </p>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Send, X, Save, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useTestSession } from '@/hooks/jlpt/useTestSession';
import { QuestionCard } from '@/components/jlpt/tryout/QuestionCard';
import { MondaiExplanationPage } from '@/components/jlpt/tryout/MondaiExplanationPage';
import { Timer } from '@/components/jlpt/tryout/Timer';
import { ProgressTracker, QuestionNavigation } from '@/components/jlpt/tryout/ProgressTracker';
import { shuffleChoices } from '@/lib/jlpt/shuffle-choices';
import type { QuestionWithDetails, SectionType, JLPTAnswerChoice } from '@/lib/jlpt/types';

interface SectionConfig {
  name: string;
  duration: number; // in seconds
}

const SECTION_CONFIG: Record<SectionType, SectionConfig> = {
  vocabulary: { name: '文字・語彙', duration: 25 * 60 }, // 25 minutes
  grammar_reading: { name: '文法・読解', duration: 50 * 60 }, // 50 minutes
  listening: { name: '聴解', duration: 30 * 60 }, // 30 minutes
};

export default function TryoutTestPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params?.attemptId as string;

  const {
    attemptId: sessionAttemptId,
    level,
    shuffleSeed,
    currentSection,
    currentQuestionIndex,
    answers,
    flaggedQuestions,
    sectionStartTimes,
    submittedSections,
    initializeTest,
    setCurrentQuestionIndex,
    setAnswer,
    toggleFlag,
    startSection,
    submitSection,
    setCurrentSection,
  } = useTestSession();

  const [questions, setQuestions] = useState<QuestionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shuffledChoicesMap, setShuffledChoicesMap] = useState<Record<string, JLPTAnswerChoice[]>>(
    {}
  );
  const [showMondaiExplanation, setShowMondaiExplanation] = useState(false);
  const [viewedMondais, setViewedMondais] = useState<Set<number>>(new Set());
  const [sectionStarted, setSectionStarted] = useState(false);

  // Initialize or resume test
  useEffect(() => {
    async function initializeOrResumeTest() {
      try {
        // If no session or different attempt, fetch attempt data
        if (!sessionAttemptId || sessionAttemptId !== attemptId) {
          const response = await fetch(`/api/jlpt/tryout/attempt/${attemptId}`);

          if (!response.ok) throw new Error('Failed to load test attempt');

          const data = await response.json();

          // Check if test is already completed
          if (data.status === 'completed') {
            toast.info('このテストは既に完了しています。結果ページに移動します。');
            router.push(`/jlpt/results/${attemptId}`);
            return;
          }

          initializeTest({
            attemptId: data.id,
            level: data.level,
            shuffleSeed: data.shuffleSeed,
            questionsSnapshot: data.questionsSnapshot,
          });

          // Restore submitted sections state
          if (data.sectionSubmissions && data.sectionSubmissions.length > 0) {
            const submittedSectionTypes = new Set<SectionType>();
            data.sectionSubmissions.forEach((submission: { sectionType: SectionType }) => {
              submitSection(submission.sectionType);
              submittedSectionTypes.add(submission.sectionType);
            });

            // Navigate to the first unsubmitted section
            const sections: SectionType[] = ['vocabulary', 'grammar_reading', 'listening'];
            const nextUnsubmittedSection = sections.find(s => !submittedSectionTypes.has(s));

            if (nextUnsubmittedSection) {
              setCurrentSection(nextUnsubmittedSection);
            } else {
              // All sections submitted, go to results
              toast.info('すべてのセクションが完了しています。結果ページに移動します。');
              router.push(`/jlpt/results/${attemptId}`);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing test:', error);
        toast.error('テストの初期化に失敗しました');
        router.push('/jlpt/tryout');
      }
    }

    initializeOrResumeTest();
  }, [attemptId, sessionAttemptId, initializeTest, submitSection, router]);

  // Load questions for current section
  useEffect(() => {
    async function loadQuestions() {
      if (!sessionAttemptId || !currentSection) return;

      try {
        setLoading(true);
        setSectionStarted(false);
        const response = await fetch(
          `/api/jlpt/tryout/questions?attemptId=${sessionAttemptId}&section=${currentSection}`
        );

        if (!response.ok) throw new Error('Failed to load questions');

        const data = await response.json();
        setQuestions(data.questions);

        // Shuffle choices for each question
        const choicesMap: Record<string, JLPTAnswerChoice[]> = {};
        data.questions.forEach((q: QuestionWithDetails) => {
          if (shuffleSeed) {
            choicesMap[q.id] = shuffleChoices(q.answerChoices, q.id, shuffleSeed);
          } else {
            choicesMap[q.id] = q.answerChoices;
          }
        });
        setShuffledChoicesMap(choicesMap);
      } catch (error) {
        console.error('Error loading questions:', error);
        toast.error('問題の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [sessionAttemptId, currentSection, shuffleSeed]);

  // Questions are already randomized per mondai by the backend
  // Use them in the order they're provided
  const currentQuestion = questions[currentQuestionIndex];

  const currentShuffledChoices = currentQuestion
    ? shuffledChoicesMap[currentQuestion.id] || []
    : [];

  // Check if we should show mondai explanation
  useEffect(() => {
    if (!currentQuestion || !sectionStarted) return;

    const mondaiNum = currentQuestion.mondaiNumber;
    const isFirstInMondai =
      currentQuestionIndex === 0 || questions[currentQuestionIndex - 1]?.mondaiNumber !== mondaiNum;

    // Show explanation if it's first question in mondai AND we haven't viewed this mondai yet
    if (isFirstInMondai && !viewedMondais.has(mondaiNum) && currentQuestion.mondaiExplanation) {
      setShowMondaiExplanation(true);
    }
  }, [currentQuestion, currentQuestionIndex, questions, viewedMondais, sectionStarted]);

  const handleStartSection = () => {
    setSectionStarted(true);
    if (!sectionStartTimes[currentSection]) {
      startSection(currentSection);
    }
  };

  const handleMondaiExplanationStart = () => {
    if (currentQuestion) {
      setViewedMondais(prev => new Set(prev).add(currentQuestion.mondaiNumber));
      setShowMondaiExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const saveAnswer = async (questionId: string, selectedAnswer: number | null) => {
    if (!sessionAttemptId) return;

    try {
      await fetch('/api/jlpt/tryout/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: sessionAttemptId,
          answers: [{ questionId, selectedAnswer }],
        }),
      });
    } catch (error) {
      console.error('Error auto-saving answer:', error);
      // Don't show error to user for auto-save failures
    }
  };

  const handleSelectAnswer = (choiceNumber: number) => {
    if (currentQuestion) {
      setAnswer(currentQuestion.id, choiceNumber);
      // Auto-save answer
      saveAnswer(currentQuestion.id, choiceNumber);
    }
  };

  const handleToggleFlag = () => {
    if (currentQuestion) {
      toggleFlag(currentQuestion.id);
    }
  };

  const handleExitTest = () => {
    const confirmed = window.confirm('テストを終了しますか？進行状況は自動保存されています。');
    if (confirmed) {
      router.push('/jlpt/tryout');
    }
  };

  const handleDiscardTest = () => {
    const confirmed = window.confirm(
      'このテストを破棄しますか？すべての進行状況が失われます。この操作は取り消せません。'
    );
    if (confirmed) {
      // TODO: Add API endpoint to discard/abandon test
      router.push('/jlpt/tryout');
    }
  };

  const handleSubmitSection = async () => {
    if (submitting) return;

    // Check if section is already submitted
    if (submittedSections.has(currentSection)) {
      toast.error('このセクションは既に提出されています');
      // Move to next section or results
      const sections: SectionType[] = ['vocabulary', 'grammar_reading', 'listening'];
      const currentIndex = sections.indexOf(currentSection);
      if (currentIndex < sections.length - 1) {
        const nextSection = sections[currentIndex + 1];
        setCurrentSection(nextSection);
        setCurrentQuestionIndex(0);
        setViewedMondais(new Set());
      } else {
        router.push(`/jlpt/results/${sessionAttemptId}`);
      }
      return;
    }

    const unansweredCount = questions.filter(q => !answers[q.id]).length;

    if (unansweredCount > 0) {
      const confirmed = window.confirm(
        `まだ${unansweredCount}問が未回答です。このセクションを提出してもよろしいですか？`
      );
      if (!confirmed) return;
    }

    setSubmitting(true);
    try {
      // Use original questions array (not sorted) for submission to match backend order
      const sectionAnswers = questions.map(q => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] ?? null,
        isFlagged: flaggedQuestions.has(q.id),
      }));

      const timeSpent = sectionStartTimes[currentSection]
        ? Math.floor((Date.now() - sectionStartTimes[currentSection]) / 1000)
        : 0;

      const response = await fetch('/api/jlpt/tryout/submit-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: sessionAttemptId,
          sectionType: currentSection,
          timeSpentSeconds: timeSpent,
          answers: sectionAnswers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Submit section error:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to submit section');
      }

      submitSection(currentSection);

      // Move to next section or results
      const sections: SectionType[] = ['vocabulary', 'grammar_reading', 'listening'];
      const currentIndex = sections.indexOf(currentSection);

      if (currentIndex < sections.length - 1) {
        const nextSection = sections[currentIndex + 1];
        setCurrentSection(nextSection);
        setCurrentQuestionIndex(0);
        setViewedMondais(new Set());
        toast.success(`セクション完了。${SECTION_CONFIG[nextSection].name}に進みます`);
      } else {
        // All sections complete, redirect to results
        router.push(`/jlpt/results/${sessionAttemptId}`);
      }
    } catch (error) {
      console.error('Error submitting section:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'セクションの提出に失敗しました';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeExpired = () => {
    toast.error('時間切れ。セクションの制限時間が終了しました。自動的に提出します。');
    handleSubmitSection();
  };

  if (loading || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">問題を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // Section start screen
  if (!sectionStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">{level} 模擬試験</h1>
            <div className="inline-block bg-card border-2 border-border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-2">{SECTION_CONFIG[currentSection].name}</h2>
              <p className="text-muted-foreground">
                制限時間: {SECTION_CONFIG[currentSection].duration / 60}分
              </p>
              <p className="text-muted-foreground">問題数: {questions.length}問</p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-200 dark:border-yellow-900 rounded-lg p-6 space-y-3">
            <h3 className="font-semibold">注意事項:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>セクション開始後、タイマーが開始されます</li>
              <li>すべての問題に回答してください</li>
              <li>不明な問題はフラグを付けて後で戻ることができます</li>
              <li>進行状況は自動保存されます</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={handleExitTest}>
              <X className="h-4 w-4 mr-2" />
              戻る
            </Button>
            <Button onClick={handleStartSection} size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              セクションを開始
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const answeredCount = questions.filter(q => answers[q.id] !== undefined).length;
  const flaggedCount = questions.filter(q => flaggedQuestions.has(q.id)).length;

  const questionsForNav = questions.map(q => ({
    id: q.id,
    isAnswered: answers[q.id] !== undefined && answers[q.id] !== null,
    isFlagged: flaggedQuestions.has(q.id),
    mondaiNumber: q.mondaiNumber,
  }));

  // Calculate display question number (position within mondai, starting from 1)
  const currentMondaiQuestions = questions.filter(
    q => q.mondaiNumber === currentQuestion.mondaiNumber
  );
  const displayQuestionNumber =
    currentMondaiQuestions.findIndex(q => q.id === currentQuestion.id) + 1;

  // Calculate current index in all questions
  const currentSortedIndex = questions.findIndex(q => q.id === currentQuestion.id);
  const sortedQuestions = questions;

  // Show mondai explanation page
  if (showMondaiExplanation && currentQuestion.mondaiExplanation) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b-2 border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">
                {level} - {SECTION_CONFIG[currentSection].name}
              </h1>
              <Timer
                durationSeconds={SECTION_CONFIG[currentSection].duration}
                onExpire={handleTimeExpired}
              />
            </div>
          </div>
        </div>

        {/* Mondai Explanation Content */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <MondaiExplanationPage
            mondaiNumber={currentQuestion.mondaiNumber}
            explanation={currentQuestion.mondaiExplanation}
            exampleQuestion={currentQuestion}
            onStart={handleMondaiExplanationStart}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b-2 border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">
                {level} - {SECTION_CONFIG[currentSection].name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExitTest}>
                <Save className="h-4 w-4 mr-2" />
                保存して終了
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDiscardTest}>
                <X className="h-4 w-4 mr-2" />
                破棄
              </Button>
              <Timer
                durationSeconds={SECTION_CONFIG[currentSection].duration}
                onExpire={handleTimeExpired}
              />
            </div>
          </div>
          <ProgressTracker
            currentIndex={currentSortedIndex}
            totalQuestions={sortedQuestions.length}
            answeredCount={answeredCount}
            flaggedCount={flaggedCount}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Question Card */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border-2 border-border p-6">
              <QuestionCard
                question={currentQuestion}
                questionNumber={displayQuestionNumber}
                mondaiNumber={currentQuestion.mondaiNumber}
                shuffledChoices={currentShuffledChoices}
                selectedAnswer={answers[currentQuestion.id] ?? null}
                isFlagged={flaggedQuestions.has(currentQuestion.id)}
                onSelectAnswer={handleSelectAnswer}
                onToggleFlag={handleToggleFlag}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentSortedIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                前へ
              </Button>

              {currentSortedIndex === sortedQuestions.length - 1 ? (
                <Button onClick={handleSubmitSection} disabled={submitting} variant="default">
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? '提出中...' : 'セクション提出'}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  次へ
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border-2 border-border p-4 sticky top-32">
              <QuestionNavigation
                questions={questionsForNav}
                currentIndex={currentSortedIndex}
                onNavigate={setCurrentQuestionIndex}
              />
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleSubmitSection}
                  disabled={submitting}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  セクション提出
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { SimplifiedAssessment } from '@/types/assessment';
import {
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  Target,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/Badge';

interface SimplifiedPostTaskReviewProps {
  assessment: SimplifiedAssessment;
  onRetry?: () => void;
  onBackToTasks?: () => void;
}

export function SimplifiedPostTaskReview({
  assessment,
  onRetry,
  onBackToTasks,
}: SimplifiedPostTaskReviewProps) {
  const completionPercentage = assessment.statistics.completionRate;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl text-green-900 dark:text-green-100">
            Task Completed!
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Great job working through this task
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-8 text-sm text-green-800 dark:text-green-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{assessment.statistics.durationMinutes} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>{assessment.statistics.totalMessages} messages</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objectives Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Learning Objectives</CardTitle>
            </div>
            <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
              {assessment.objectivesAchieved} / {assessment.totalObjectives} Completed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          <div className="space-y-3">
            {assessment.objectives.map((objective, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  objective.achieved
                    ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                }`}
              >
                {objective.achieved ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={
                      objective.achieved
                        ? 'text-green-900 dark:text-green-100 font-medium'
                        : 'text-gray-600 dark:text-gray-400'
                    }
                  >
                    {objective.text}
                  </p>
                  {objective.achieved && objective.evidence.length > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ Demonstrated in conversation
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Feedback & Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Feedback */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Overall Assessment</h3>
            <p className="text-muted-foreground leading-relaxed">
              {assessment.conversationFeedback.overallFeedback}
            </p>
          </div>

          {/* Strengths */}
          {assessment.conversationFeedback.strengths.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 text-green-700 dark:text-green-400">
                💪 What You Did Well
              </h3>
              <ul className="space-y-2">
                {assessment.conversationFeedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas to Improve */}
          {assessment.conversationFeedback.areasToImprove.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 text-blue-700 dark:text-blue-400">
                🎯 Areas to Focus On
              </h3>
              <ul className="space-y-2">
                {assessment.conversationFeedback.areasToImprove.map((area, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Encouragement */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <p className="text-purple-900 dark:text-purple-100 font-medium text-center">
              {assessment.conversationFeedback.encouragement}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Recommended Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {assessment.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-muted-foreground pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-4">
        {assessment.suggestRetry && onRetry && (
          <Button onClick={onRetry} variant="outline" size="lg">
            Retry This Task
          </Button>
        )}
        {onBackToTasks && (
          <Button onClick={onBackToTasks} size="lg">
            Back to Tasks
          </Button>
        )}
      </div>
    </div>
  );
}

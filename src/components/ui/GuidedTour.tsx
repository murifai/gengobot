/**
 * GuidedTour Component
 *
 * Interactive guided tour system for task-based learning.
 * Provides step-by-step onboarding and feature discovery.
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';

export interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Tour {
  id: string;
  name: string;
  steps: TourStep[];
  onComplete?: () => void;
}

interface TourContextValue {
  currentTour: Tour | null;
  currentStep: number;
  isActive: boolean;
  startTour: (tour: Tour) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
}

export function TourProvider({ children }: { children: ReactNode }) {
  const [currentTour, setCurrentTour] = useState<Tour | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const startTour = useCallback((tour: Tour) => {
    setCurrentTour(tour);
    setCurrentStep(0);
    setIsActive(true);

    // Save that user has seen this tour
    try {
      const seenTours = JSON.parse(localStorage.getItem('gengobot_seen_tours') || '[]');
      if (!seenTours.includes(tour.id)) {
        seenTours.push(tour.id);
        localStorage.setItem('gengobot_seen_tours', JSON.stringify(seenTours));
      }
    } catch (error) {
      console.error('Failed to save tour progress:', error);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (!currentTour) return;

    if (currentStep < currentTour.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  }, [currentTour, currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setCurrentTour(null);
    setCurrentStep(0);
  }, []);

  const completeTour = useCallback(() => {
    if (currentTour?.onComplete) {
      currentTour.onComplete();
    }
    skipTour();
  }, [currentTour, skipTour]);

  return (
    <TourContext.Provider
      value={{
        currentTour,
        currentStep,
        isActive,
        startTour,
        nextStep,
        previousStep,
        skipTour,
        completeTour,
      }}
    >
      {children}
      {isActive && currentTour && (
        <TourOverlay
          tour={currentTour}
          currentStep={currentStep}
          onNext={nextStep}
          onPrevious={previousStep}
          onSkip={skipTour}
        />
      )}
    </TourContext.Provider>
  );
}

interface TourOverlayProps {
  tour: Tour;
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}

function TourOverlay({ tour, currentStep, onNext, onPrevious, onSkip }: TourOverlayProps) {
  const step = tour.steps[currentStep];
  const [targetPosition, setTargetPosition] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!step) return;

    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetPosition(rect);

      // Scroll target into view
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Highlight target
      target.classList.add('tour-highlight');
      return () => {
        target.classList.remove('tour-highlight');
      };
    }
  }, [step]);

  if (!step || !targetPosition) return null;

  const placement = step.placement || 'bottom';
  const tooltipStyle = calculateTooltipPosition(targetPosition, placement);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onSkip} />

      {/* Spotlight */}
      <div
        className="fixed z-50 pointer-events-none"
        style={{
          top: targetPosition.top - 4,
          left: targetPosition.left - 4,
          width: targetPosition.width + 8,
          height: targetPosition.height + 8,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          borderRadius: '8px',
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-card border border-border rounded-lg shadow-xl p-6 max-w-sm"
        style={tooltipStyle}
      >
        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
          <p className="text-sm text-muted-foreground">{step.content}</p>
        </div>

        {step.action && (
          <button
            onClick={step.action.onClick}
            className="w-full mb-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {step.action.label}
          </button>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {tour.steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              スキップ
            </button>

            {currentStep > 0 && (
              <button
                onClick={onPrevious}
                className="px-3 py-1 text-sm bg-muted text-foreground rounded hover:bg-accent transition-colors"
              >
                戻る
              </button>
            )}

            <button
              onClick={onNext}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              {currentStep === tour.steps.length - 1 ? '完了' : '次へ'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function calculateTooltipPosition(targetRect: DOMRect, placement: string): React.CSSProperties {
  const offset = 16;
  const style: React.CSSProperties = {};

  switch (placement) {
    case 'top':
      style.top = targetRect.top - offset;
      style.left = targetRect.left + targetRect.width / 2;
      style.transform = 'translate(-50%, -100%)';
      break;
    case 'bottom':
      style.top = targetRect.bottom + offset;
      style.left = targetRect.left + targetRect.width / 2;
      style.transform = 'translateX(-50%)';
      break;
    case 'left':
      style.top = targetRect.top + targetRect.height / 2;
      style.left = targetRect.left - offset;
      style.transform = 'translate(-100%, -50%)';
      break;
    case 'right':
      style.top = targetRect.top + targetRect.height / 2;
      style.left = targetRect.right + offset;
      style.transform = 'translateY(-50%)';
      break;
  }

  return style;
}

/**
 * Predefined tours for common user journeys
 */
export const TOURS: Record<string, Tour> = {
  onboarding: {
    id: 'onboarding',
    name: 'Welcome to Gengotalk',
    steps: [
      {
        id: 'welcome',
        target: '#app-header',
        title: 'ようこそGengotalkへ！ (Welcome to Gengotalk!)',
        content: 'タスクベースの会話で日本語を学びましょう。',
        placement: 'bottom',
      },
      {
        id: 'task-selection',
        target: '#task-library',
        title: 'タスクライブラリ (Task Library)',
        content: 'レベルやカテゴリーでタスクを選択できます。',
        placement: 'right',
      },
      {
        id: 'start-task',
        target: '#start-task-btn',
        title: 'タスク開始 (Start Task)',
        content: 'クリックしてタスクを開始しましょう！',
        placement: 'top',
      },
    ],
  },

  taskChat: {
    id: 'task-chat',
    name: 'Task-Based Chat',
    steps: [
      {
        id: 'objectives',
        target: '#task-objectives',
        title: 'タスク目標 (Task Objectives)',
        content: 'このエリアで進捗を確認できます。',
        placement: 'left',
      },
      {
        id: 'voice-input',
        target: '#voice-button',
        title: '音声入力 (Voice Input)',
        content: 'マイクボタンで音声入力ができます。',
        placement: 'top',
      },
      {
        id: 'hints',
        target: '#hint-button',
        title: 'ヒント (Hints)',
        content: '困ったときはヒントを利用しましょう。',
        placement: 'top',
      },
    ],
  },
};

/**
 * Hook to check if user has seen a tour
 */
export function useHasSeenTour(tourId: string): boolean {
  const [hasSeen, setHasSeen] = useState(false);

  useEffect(() => {
    try {
      const seenTours = JSON.parse(localStorage.getItem('gengobot_seen_tours') || '[]');
      setHasSeen(seenTours.includes(tourId));
    } catch (error) {
      console.error('Failed to check tour status:', error);
    }
  }, [tourId]);

  return hasSeen;
}

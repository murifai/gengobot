/**
 * JLPT Test Session State Management
 *
 * Zustand store for managing test session state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JLPTLevel, SectionType, QuestionSnapshot } from '@/lib/jlpt/types';

interface TestSessionState {
  // Test metadata
  attemptId: string | null;
  level: JLPTLevel | null;
  shuffleSeed: string | null;
  questionsSnapshot: QuestionSnapshot | null;

  // Current position
  currentSection: SectionType;
  currentQuestionIndex: number;

  // User answers (questionId -> choice number 1-4)
  answers: Record<string, number | null>;

  // Flagged questions for review
  flaggedQuestions: Set<string>;

  // Section timing
  sectionStartTimes: Record<SectionType, number>; // timestamp in ms
  submittedSections: Set<SectionType>;

  // Actions
  initializeTest: (data: {
    attemptId: string;
    level: JLPTLevel;
    shuffleSeed: string;
    questionsSnapshot: QuestionSnapshot;
  }) => void;

  setCurrentSection: (section: SectionType) => void;
  setCurrentQuestionIndex: (index: number) => void;

  setAnswer: (questionId: string, choice: number | null) => void;
  toggleFlag: (questionId: string) => void;

  startSection: (section: SectionType) => void;
  submitSection: (section: SectionType) => void;

  reset: () => void;
}

const initialState = {
  attemptId: null,
  level: null,
  shuffleSeed: null,
  questionsSnapshot: null,
  currentSection: 'vocabulary' as SectionType,
  currentQuestionIndex: 0,
  answers: {},
  flaggedQuestions: new Set<string>(),
  sectionStartTimes: {} as Record<SectionType, number>,
  submittedSections: new Set<SectionType>(),
};

export const useTestSession = create<TestSessionState>()(
  persist(
    set => ({
      ...initialState,

      initializeTest: data => {
        set({
          attemptId: data.attemptId,
          level: data.level,
          shuffleSeed: data.shuffleSeed,
          questionsSnapshot: data.questionsSnapshot,
          currentSection: 'vocabulary',
          currentQuestionIndex: 0,
          answers: {},
          flaggedQuestions: new Set(),
          sectionStartTimes: {
            vocabulary: Date.now(),
            grammar_reading: 0,
            listening: 0,
          },
          submittedSections: new Set(),
        });
      },

      setCurrentSection: section => {
        set({ currentSection: section, currentQuestionIndex: 0 });
      },

      setCurrentQuestionIndex: index => {
        set({ currentQuestionIndex: index });
      },

      setAnswer: (questionId, choice) => {
        set(state => ({
          answers: {
            ...state.answers,
            [questionId]: choice,
          },
        }));
      },

      toggleFlag: questionId => {
        set(state => {
          const newFlags = new Set(state.flaggedQuestions);
          if (newFlags.has(questionId)) {
            newFlags.delete(questionId);
          } else {
            newFlags.add(questionId);
          }
          return { flaggedQuestions: newFlags };
        });
      },

      startSection: section => {
        set(state => ({
          sectionStartTimes: {
            ...state.sectionStartTimes,
            [section]: Date.now(),
          },
        }));
      },

      submitSection: section => {
        set(state => {
          const newSubmitted = new Set(state.submittedSections);
          newSubmitted.add(section);
          return { submittedSections: newSubmitted };
        });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'jlpt-test-session',
      // Only persist essential data
      partialize: state => ({
        attemptId: state.attemptId,
        level: state.level,
        shuffleSeed: state.shuffleSeed,
        questionsSnapshot: state.questionsSnapshot,
        currentSection: state.currentSection,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        flaggedQuestions: Array.from(state.flaggedQuestions),
        sectionStartTimes: state.sectionStartTimes,
        submittedSections: Array.from(state.submittedSections),
      }),
      // Restore Sets from Arrays
      onRehydrateStorage: () => state => {
        if (state) {
          state.flaggedQuestions = new Set(state.flaggedQuestions as unknown as string[]);
          state.submittedSections = new Set(state.submittedSections as unknown as SectionType[]);
        }
      },
    }
  )
);

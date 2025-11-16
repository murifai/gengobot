/**
 * Centralized lazy imports for code splitting
 * Phase 4: Performance Optimization
 */

import React from 'react';
import dynamic from 'next/dynamic';
import { LoadingState } from '@/components/ui/LoadingState';

// Loading component for lazy imports
const DefaultLoader = () => {
  return React.createElement(LoadingState, { type: 'spinner', size: 'lg' });
};

// Kaiwa Components
export const LazyFreeConversationClient = dynamic(
  () => import('@/app/app/kaiwa/bebas/FreeConversationClient'),
  {
    loading: DefaultLoader,
    ssr: false,
  }
);

export const LazyTaskList = dynamic(() => import('@/components/task/TaskList'), {
  loading: DefaultLoader,
});

export const LazyRoleplaySession = dynamic(() => import('@/components/task/RoleplaySession'), {
  loading: DefaultLoader,
  ssr: false,
});

// Drill Components
export const LazyDeckLearningWithStats = dynamic(
  () => import('@/components/deck/DeckLearningWithStats'),
  {
    loading: DefaultLoader,
    ssr: false,
  }
);

export const LazyDeckList = dynamic(() => import('@/components/deck/DeckList'), {
  loading: DefaultLoader,
});

export const LazyFlashcardEditor = dynamic(() => import('@/components/flashcard/FlashcardEditor'), {
  loading: DefaultLoader,
  ssr: false,
});

// Dashboard Components
export const LazyStatsCard = dynamic(() => import('@/components/dashboard/stats-card'), {
  loading: () =>
    React.createElement('div', {
      className: 'animate-pulse bg-gray-200 dark:bg-gray-800 h-32 rounded-lg',
    }),
});

export const LazyActivityChart = dynamic(() => import('@/components/dashboard/activity-chart'), {
  loading: () =>
    React.createElement('div', {
      className: 'animate-pulse bg-gray-200 dark:bg-gray-800 h-64 rounded-lg',
    }),
});

export const LazyRecentActivity = dynamic(() => import('@/components/dashboard/recent-activity'), {
  loading: () =>
    React.createElement('div', {
      className: 'animate-pulse bg-gray-200 dark:bg-gray-800 h-96 rounded-lg',
    }),
});

// Profile Components
export const LazyCharacterForm = dynamic(() => import('@/components/character/CharacterForm'), {
  loading: DefaultLoader,
  ssr: false,
});

export const LazyProgressChart = dynamic(() => import('@/components/dashboard/progress-chart'), {
  loading: () =>
    React.createElement('div', {
      className: 'animate-pulse bg-gray-200 dark:bg-gray-800 h-96 rounded-lg',
    }),
});

// Heavy Libraries (charts, editors, etc)
export const LazyRichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), {
  loading: DefaultLoader,
  ssr: false,
});

// Admin Components
export const LazyAdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard'), {
  loading: DefaultLoader,
});

/**
 * Prefetch components on hover for instant loading
 */
export const prefetchComponent = (componentName: keyof typeof lazyComponents) => {
  const component = lazyComponents[componentName];
  if (component && 'preload' in component && typeof component.preload === 'function') {
    component.preload();
  }
};

const lazyComponents = {
  FreeConversationClient: LazyFreeConversationClient,
  TaskList: LazyTaskList,
  RoleplaySession: LazyRoleplaySession,
  DeckLearningWithStats: LazyDeckLearningWithStats,
  DeckList: LazyDeckList,
  FlashcardEditor: LazyFlashcardEditor,
  StatsCard: LazyStatsCard,
  ActivityChart: LazyActivityChart,
  RecentActivity: LazyRecentActivity,
  CharacterForm: LazyCharacterForm,
  ProgressChart: LazyProgressChart,
  RichTextEditor: LazyRichTextEditor,
  AdminDashboard: LazyAdminDashboard,
};

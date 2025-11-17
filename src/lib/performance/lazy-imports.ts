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

// Drill Components
export const LazyDeckLearningWithStats = dynamic(
  () => import('@/components/deck/DeckLearningWithStats'),
  {
    loading: DefaultLoader,
    ssr: false,
  }
);

// Dashboard Components (named exports)
export const LazyStatsCard = dynamic(
  () => import('@/components/dashboard/stats-card').then(mod => mod.StatsCard),
  {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 dark:bg-gray-800 h-32 rounded-lg',
      }),
  }
);

export const LazyActivityChart = dynamic(
  () => import('@/components/dashboard/activity-chart').then(mod => mod.ActivityChart),
  {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 dark:bg-gray-800 h-64 rounded-lg',
      }),
  }
);

export const LazyRecentActivity = dynamic(
  () => import('@/components/dashboard/recent-activity').then(mod => mod.RecentActivity),
  {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 dark:bg-gray-800 h-96 rounded-lg',
      }),
  }
);

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
  DeckLearningWithStats: LazyDeckLearningWithStats,
  StatsCard: LazyStatsCard,
  ActivityChart: LazyActivityChart,
  RecentActivity: LazyRecentActivity,
};

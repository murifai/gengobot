'use client';

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

// Admin Chart Components (recharts heavy - 295KB)
export const LazyUserAnalyticsTab = dynamic(
  () => import('@/components/admin/statistik/UserAnalyticsTab').then(mod => mod.UserAnalyticsTab),
  {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 dark:bg-gray-800 h-96 rounded-lg',
      }),
    ssr: false,
  }
);

export const LazyEarningReportsTab = dynamic(
  () => import('@/components/admin/statistik/EarningReportsTab').then(mod => mod.EarningReportsTab),
  {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 dark:bg-gray-800 h-96 rounded-lg',
      }),
    ssr: false,
  }
);

export const LazySubscriberChart = dynamic(
  () => import('@/components/admin/dashboard/SubscriberChart').then(mod => mod.SubscriberChart),
  {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 dark:bg-gray-800 h-64 rounded-lg',
      }),
    ssr: false,
  }
);

export const LazyUserByLevelChart = dynamic(
  () => import('@/components/admin/dashboard/UserByLevelChart').then(mod => mod.UserByLevelChart),
  {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 dark:bg-gray-800 h-64 rounded-lg',
      }),
    ssr: false,
  }
);

export const LazyUserByDomicileChart = dynamic(
  () =>
    import('@/components/admin/dashboard/UserByDomicileChart').then(mod => mod.UserByDomicileChart),
  {
    loading: () =>
      React.createElement('div', {
        className: 'animate-pulse bg-gray-200 dark:bg-gray-800 h-64 rounded-lg',
      }),
    ssr: false,
  }
);

const lazyComponents = {
  FreeConversationClient: LazyFreeConversationClient,
  DeckLearningWithStats: LazyDeckLearningWithStats,
  StatsCard: LazyStatsCard,
  ActivityChart: LazyActivityChart,
  RecentActivity: LazyRecentActivity,
  UserAnalyticsTab: LazyUserAnalyticsTab,
  EarningReportsTab: LazyEarningReportsTab,
  SubscriberChart: LazySubscriberChart,
  UserByLevelChart: LazyUserByLevelChart,
  UserByDomicileChart: LazyUserByDomicileChart,
};

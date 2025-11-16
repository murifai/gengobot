/**
 * React Query Client Configuration
 * Phase 4: Performance Optimization - API Caching
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)

      // Retry configuration
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch configuration
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,

      // Network mode
      networkMode: 'online',
    },
    mutations: {
      // Retry configuration for mutations
      retry: 1,
      networkMode: 'online',
    },
  },
});

/**
 * Query key factory for consistent cache keys
 */
export const queryKeys = {
  // User
  user: {
    all: ['user'] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    settings: () => [...queryKeys.user.all, 'settings'] as const,
  },

  // Characters
  characters: {
    all: ['characters'] as const,
    list: () => [...queryKeys.characters.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.characters.all, 'detail', id] as const,
  },

  // Kaiwa
  kaiwa: {
    all: ['kaiwa'] as const,
    sessions: () => [...queryKeys.kaiwa.all, 'sessions'] as const,
    session: (id: string) => [...queryKeys.kaiwa.all, 'session', id] as const,
    messages: (sessionId: string) => [...queryKeys.kaiwa.all, 'messages', sessionId] as const,
  },

  // Tasks
  tasks: {
    all: ['tasks'] as const,
    list: (filters?: Record<string, string | number | boolean>) =>
      [...queryKeys.tasks.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.tasks.all, 'detail', id] as const,
    attempts: (taskId: string) => [...queryKeys.tasks.all, 'attempts', taskId] as const,
  },

  // Decks
  decks: {
    all: ['decks'] as const,
    list: () => [...queryKeys.decks.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.decks.all, 'detail', id] as const,
    flashcards: (deckId: string) => [...queryKeys.decks.all, 'flashcards', deckId] as const,
  },

  // Drill Sessions
  drillSessions: {
    all: ['drill-sessions'] as const,
    current: () => [...queryKeys.drillSessions.all, 'current'] as const,
    session: (id: string) => [...queryKeys.drillSessions.all, 'session', id] as const,
    history: () => [...queryKeys.drillSessions.all, 'history'] as const,
  },

  // Stats
  stats: {
    all: ['stats'] as const,
    kaiwa: () => [...queryKeys.stats.all, 'kaiwa'] as const,
    drill: () => [...queryKeys.stats.all, 'drill'] as const,
    weekly: () => [...queryKeys.stats.all, 'weekly'] as const,
    overall: () => [...queryKeys.stats.all, 'overall'] as const,
  },

  // Progress
  progress: {
    all: ['progress'] as const,
    jlpt: (level?: string) => [...queryKeys.progress.all, 'jlpt', level] as const,
    vocabulary: () => [...queryKeys.progress.all, 'vocabulary'] as const,
    tasks: () => [...queryKeys.progress.all, 'tasks'] as const,
  },
} as const;

/**
 * Prefetch utilities
 */
export const prefetchQueries = {
  /**
   * Prefetch user data
   */
  async user(client: QueryClient) {
    await client.prefetchQuery({
      queryKey: queryKeys.user.current(),
      queryFn: () => fetch('/api/user/current').then(res => res.json()),
    });
  },

  /**
   * Prefetch characters
   */
  async characters(client: QueryClient) {
    await client.prefetchQuery({
      queryKey: queryKeys.characters.list(),
      queryFn: () => fetch('/api/characters').then(res => res.json()),
    });
  },

  /**
   * Prefetch decks
   */
  async decks(client: QueryClient) {
    await client.prefetchQuery({
      queryKey: queryKeys.decks.list(),
      queryFn: () => fetch('/api/app/decks').then(res => res.json()),
    });
  },

  /**
   * Prefetch stats
   */
  async stats(client: QueryClient) {
    await Promise.all([
      client.prefetchQuery({
        queryKey: queryKeys.stats.kaiwa(),
        queryFn: () => fetch('/api/stats/kaiwa').then(res => res.json()),
      }),
      client.prefetchQuery({
        queryKey: queryKeys.stats.drill(),
        queryFn: () => fetch('/api/stats/drill').then(res => res.json()),
      }),
      client.prefetchQuery({
        queryKey: queryKeys.stats.weekly(),
        queryFn: () => fetch('/api/stats/weekly').then(res => res.json()),
      }),
    ]);
  },
};

/**
 * Cache invalidation utilities
 */
export const invalidateQueries = {
  /**
   * Invalidate all user-related queries
   */
  async user(client: QueryClient) {
    await client.invalidateQueries({ queryKey: queryKeys.user.all });
  },

  /**
   * Invalidate character queries
   */
  async characters(client: QueryClient, characterId?: string) {
    if (characterId) {
      await client.invalidateQueries({
        queryKey: queryKeys.characters.detail(characterId),
      });
    } else {
      await client.invalidateQueries({ queryKey: queryKeys.characters.all });
    }
  },

  /**
   * Invalidate deck queries
   */
  async decks(client: QueryClient, deckId?: string) {
    if (deckId) {
      await client.invalidateQueries({
        queryKey: queryKeys.decks.detail(deckId),
      });
      await client.invalidateQueries({
        queryKey: queryKeys.decks.flashcards(deckId),
      });
    } else {
      await client.invalidateQueries({ queryKey: queryKeys.decks.all });
    }
  },

  /**
   * Invalidate stats
   */
  async stats(client: QueryClient) {
    await client.invalidateQueries({ queryKey: queryKeys.stats.all });
  },

  /**
   * Invalidate progress
   */
  async progress(client: QueryClient) {
    await client.invalidateQueries({ queryKey: queryKeys.progress.all });
  },
};

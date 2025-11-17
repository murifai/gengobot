/**
 * React Query Hooks for Data Fetching
 * Phase 4: Performance Optimization
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateQueries } from './client';

// Generic data type for mutations
type MutationData = Record<string, unknown>;

/**
 * User hooks
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: async () => {
      const response = await fetch('/api/user/current');
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: async () => {
      const response = await fetch('/api/user/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
  });
}

/**
 * Character hooks
 */
export function useCharacters() {
  return useQuery({
    queryKey: queryKeys.characters.list(),
    queryFn: async () => {
      const response = await fetch('/api/characters');
      if (!response.ok) throw new Error('Failed to fetch characters');
      return response.json();
    },
  });
}

export function useCharacter(characterId: string) {
  return useQuery({
    queryKey: queryKeys.characters.detail(characterId),
    queryFn: async () => {
      const response = await fetch(`/api/characters/${characterId}`);
      if (!response.ok) throw new Error('Failed to fetch character');
      return response.json();
    },
    enabled: !!characterId,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MutationData) => {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create character');
      return response.json();
    },
    onSuccess: () => {
      invalidateQueries.characters(queryClient);
    },
  });
}

export function useUpdateCharacter(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MutationData) => {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update character');
      return response.json();
    },
    onSuccess: () => {
      invalidateQueries.characters(queryClient, characterId);
    },
  });
}

/**
 * Task hooks
 */
export function useTasks(filters?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: queryKeys.tasks.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams(
        filters
          ? Object.entries(filters).reduce(
              (acc, [key, value]) => ({ ...acc, [key]: String(value) }),
              {} as Record<string, string>
            )
          : undefined
      );
      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(taskId),
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) throw new Error('Failed to fetch task');
      return response.json();
    },
    enabled: !!taskId,
  });
}

/**
 * Deck hooks
 */
export function useDecks() {
  return useQuery({
    queryKey: queryKeys.decks.list(),
    queryFn: async () => {
      const response = await fetch('/api/app/decks');
      if (!response.ok) throw new Error('Failed to fetch decks');
      return response.json();
    },
  });
}

export function useDeck(deckId: string) {
  return useQuery({
    queryKey: queryKeys.decks.detail(deckId),
    queryFn: async () => {
      const response = await fetch(`/api/app/decks/${deckId}`);
      if (!response.ok) throw new Error('Failed to fetch deck');
      return response.json();
    },
    enabled: !!deckId,
  });
}

export function useCreateDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MutationData) => {
      const response = await fetch('/api/app/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create deck');
      return response.json();
    },
    onSuccess: () => {
      invalidateQueries.decks(queryClient);
      invalidateQueries.stats(queryClient);
    },
  });
}

/**
 * Drill Session hooks
 */
export function useDrillSession(deckId: string) {
  return useQuery({
    queryKey: queryKeys.drillSessions.current(),
    queryFn: async () => {
      const response = await fetch('/api/app/drill-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckId }),
      });
      if (!response.ok) throw new Error('Failed to start drill session');
      return response.json();
    },
    enabled: !!deckId,
  });
}

export function useUpdateDrillSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MutationData) => {
      const response = await fetch(`/api/app/drill-sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update drill session');
      return response.json();
    },
    onSuccess: () => {
      invalidateQueries.stats(queryClient);
      invalidateQueries.progress(queryClient);
    },
  });
}

/**
 * Stats hooks
 */
export function useKaiwaStats() {
  return useQuery({
    queryKey: queryKeys.stats.kaiwa(),
    queryFn: async () => {
      const response = await fetch('/api/stats/kaiwa');
      if (!response.ok) throw new Error('Failed to fetch kaiwa stats');
      return response.json();
    },
  });
}

export function useDrillStats() {
  return useQuery({
    queryKey: queryKeys.stats.drill(),
    queryFn: async () => {
      const response = await fetch('/api/stats/drill');
      if (!response.ok) throw new Error('Failed to fetch drill stats');
      return response.json();
    },
  });
}

export function useWeeklyStats() {
  return useQuery({
    queryKey: queryKeys.stats.weekly(),
    queryFn: async () => {
      const response = await fetch('/api/stats/weekly');
      if (!response.ok) throw new Error('Failed to fetch weekly stats');
      return response.json();
    },
  });
}

export function useOverallStats() {
  return useQuery({
    queryKey: queryKeys.stats.overall(),
    queryFn: async () => {
      const response = await fetch('/api/stats/overall');
      if (!response.ok) throw new Error('Failed to fetch overall stats');
      return response.json();
    },
  });
}

/**
 * Progress hooks
 */
export function useJLPTProgress(level?: string) {
  return useQuery({
    queryKey: queryKeys.progress.jlpt(level),
    queryFn: async () => {
      const params = level ? `?level=${level}` : '';
      const response = await fetch(`/api/progress/jlpt${params}`);
      if (!response.ok) throw new Error('Failed to fetch JLPT progress');
      return response.json();
    },
  });
}

export function useVocabularyProgress() {
  return useQuery({
    queryKey: queryKeys.progress.vocabulary(),
    queryFn: async () => {
      const response = await fetch('/api/progress/vocabulary');
      if (!response.ok) throw new Error('Failed to fetch vocabulary progress');
      return response.json();
    },
  });
}

/**
 * Optimistic update utilities
 */
export function useOptimisticUpdate() {
  const queryClient = useQueryClient();

  const updateCharacter = (characterId: string, updater: (old: unknown) => unknown) => {
    queryClient.setQueryData(queryKeys.characters.detail(characterId), updater);
  };

  const updateDeck = (deckId: string, updater: (old: unknown) => unknown) => {
    queryClient.setQueryData(queryKeys.decks.detail(deckId), updater);
  };

  return { updateCharacter, updateDeck };
}

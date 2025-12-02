/**
 * React hooks for analytics tracking
 * Phase 4: Analytics Integration
 */

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { analytics, EventName, EventProperties } from './events';

/**
 * Track page views automatically
 */
export function usePageTracking() {
  const pathname = usePathname();
  const previousPath = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (pathname && pathname !== previousPath.current) {
      analytics.trackNavigation(previousPath.current || '/', pathname);
      analytics.pageView(pathname);
      previousPath.current = pathname;
    }
  }, [pathname]);
}

/**
 * Track specific events
 */
export function useTrackEvent() {
  return useCallback((eventName: EventName, properties?: EventProperties) => {
    analytics.track(eventName, properties);
  }, []);
}

/**
 * Track component mount/unmount
 */
export function useTrackLifecycle(componentName: string, properties?: EventProperties) {
  useEffect(() => {
    const mounted = Date.now();

    return () => {
      const duration = Date.now() - mounted;
      analytics.track('page_view', {
        label: `${componentName}_duration`,
        value: duration,
        ...properties,
      });
    };
  }, [componentName, properties]);
}

/**
 * Track session duration
 */
export function useTrackSession(sessionType: string) {
  const sessionStart = useRef<number>(Date.now());
  const eventCount = useRef<number>(0);

  const trackEvent = useCallback(
    (eventName: string, properties?: EventProperties) => {
      eventCount.current += 1;
      analytics.track(eventName as EventName, {
        sessionType,
        sessionDuration: Date.now() - sessionStart.current,
        eventCount: eventCount.current,
        ...properties,
      });
    },
    [sessionType]
  );

  const endSession = useCallback(() => {
    const duration = Date.now() - sessionStart.current;
    analytics.track('kaiwa_session_complete', {
      sessionType,
      duration,
      eventCount: eventCount.current,
    });
  }, [sessionType]);

  return { trackEvent, endSession };
}

/**
 * Track errors
 */
export function useTrackError() {
  return useCallback((error: Error, context?: string) => {
    analytics.trackError(error, context);
  }, []);
}

/**
 * Track performance metrics
 */
export function usePerformanceTracking(metricName: string) {
  const startTime = useRef<number | undefined>(undefined);

  const start = useCallback(() => {
    startTime.current = Date.now();
  }, []);

  const end = useCallback(
    (properties?: EventProperties) => {
      if (startTime.current !== undefined) {
        const duration = Date.now() - startTime.current;
        analytics.track('page_view', {
          label: `perf_${metricName}`,
          value: duration,
          ...properties,
        });
        startTime.current = undefined;
      }
    },
    [metricName]
  );

  return { start, end };
}

/**
 * Track user interactions
 */
export function useTrackInteraction() {
  return useCallback((action: string, category: string, label?: string, value?: number) => {
    analytics.track('page_view', {
      label: `${category}_${action}`,
      value,
      source: label,
    });
  }, []);
}

/**
 * Track Kaiwa session
 */
export function useTrackKaiwaSession(type: 'bebas' | 'roleplay', characterId?: string) {
  const sessionStart = useRef<number>(Date.now());
  const messageCount = useRef<number>(0);

  useEffect(() => {
    const startTime = sessionStart.current;
    analytics.trackKaiwaSession('start', { type, characterId });

    return () => {
      const duration = Date.now() - startTime;
      analytics.trackKaiwaSession('complete', {
        type,
        characterId,
        duration,
        messageCount: messageCount.current,
      });
    };
  }, [type, characterId]);

  const trackMessage = useCallback(() => {
    messageCount.current += 1;
  }, []);

  return { trackMessage };
}

/**
 * Track Drill session
 */
export function useTrackDrillSession(deckId: string) {
  const sessionStart = useRef<number>(Date.now());
  const cardsReviewed = useRef<number>(0);
  const masteredCards = useRef<number>(0);

  useEffect(() => {
    const startTime = sessionStart.current;
    analytics.trackDrillSession('start', { deckId });

    return () => {
      const duration = Date.now() - startTime;
      analytics.trackDrillSession('complete', {
        deckId,
        cardsCount: cardsReviewed.current,
        masteredCards: masteredCards.current,
        duration,
      });
    };
  }, [deckId]);

  const trackCardReview = useCallback(
    (mastered: boolean) => {
      cardsReviewed.current += 1;
      if (mastered) {
        masteredCards.current += 1;
      }
      analytics.track('drill_card_reviewed', {
        deckId,
        mastered,
      });
    },
    [deckId]
  );

  return { trackCardReview };
}

/**
 * Track form submissions
 */
export function useTrackForm(formName: string) {
  const trackSubmit = useCallback(
    (success: boolean, errorMessage?: string) => {
      analytics.track('page_view', {
        label: `form_${formName}_${success ? 'success' : 'error'}`,
        source: errorMessage,
      });
    },
    [formName]
  );

  return { trackSubmit };
}

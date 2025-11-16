/**
 * Analytics Event Tracking
 * Phase 4: Analytics Integration
 */

export type EventName =
  // Navigation
  | 'page_view'
  | 'navigation'
  // Kaiwa Events
  | 'kaiwa_session_start'
  | 'kaiwa_session_complete'
  | 'kaiwa_message_sent'
  | 'kaiwa_voice_toggle'
  // Roleplay Events
  | 'roleplay_task_start'
  | 'roleplay_task_complete'
  | 'roleplay_task_feedback'
  // Drill Events
  | 'drill_session_start'
  | 'drill_session_complete'
  | 'drill_card_reviewed'
  | 'drill_deck_created'
  // Character Events
  | 'character_created'
  | 'character_updated'
  | 'character_deleted'
  // Cross-feature Events
  | 'save_word_to_deck'
  | 'share_deck'
  // User Events
  | 'user_signup'
  | 'user_login'
  | 'settings_updated'
  // Error Events
  | 'error_occurred';

export interface EventProperties {
  // Common properties
  userId?: string;
  sessionId?: string;
  timestamp?: number;

  // Navigation
  from?: string;
  to?: string;

  // Kaiwa
  type?: 'bebas' | 'roleplay';
  characterId?: string;
  duration?: number;
  messageCount?: number;
  voiceEnabled?: boolean;

  // Roleplay
  taskId?: string;
  jlptLevel?: string;
  category?: string;
  score?: number;

  // Drill
  deckId?: string;
  cardsCount?: number;
  masteredCards?: number;
  newCards?: number;
  reviewCards?: number;

  // General
  source?: string;
  value?: number;
  label?: string;

  // Error
  errorMessage?: string;
  errorStack?: string;

  [key: string]: string | number | boolean | undefined | null;
}

class Analytics {
  private static instance: Analytics;
  private enabled: boolean;
  private debugMode: boolean;

  private constructor() {
    this.enabled =
      typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
    this.debugMode = process.env.NODE_ENV === 'development';
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  /**
   * Track an event
   */
  track(eventName: EventName, properties?: EventProperties): void {
    if (!this.enabled && !this.debugMode) return;

    const eventData = {
      event: eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      },
    };

    if (this.debugMode) {
      console.log('📊 Analytics Event:', eventData);
    }

    // Google Analytics 4
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
      if (gtag) gtag('event', eventName, eventData.properties);
    }

    // Send to custom analytics endpoint (optional)
    this.sendToBackend(eventData);
  }

  /**
   * Track page view
   */
  pageView(pagePath: string, pageTitle?: string): void {
    this.track('page_view', {
      to: pagePath,
      label: pageTitle,
    });
  }

  /**
   * Track navigation
   */
  trackNavigation(from: string, to: string): void {
    this.track('navigation', { from, to });
  }

  /**
   * Track Kaiwa session
   */
  trackKaiwaSession(
    action: 'start' | 'complete',
    properties: {
      type: 'bebas' | 'roleplay';
      characterId?: string;
      duration?: number;
      messageCount?: number;
    }
  ): void {
    this.track(action === 'start' ? 'kaiwa_session_start' : 'kaiwa_session_complete', properties);
  }

  /**
   * Track Roleplay task
   */
  trackRoleplayTask(
    action: 'start' | 'complete',
    properties: {
      taskId: string;
      jlptLevel?: string;
      category?: string;
      score?: number;
      duration?: number;
    }
  ): void {
    this.track(action === 'start' ? 'roleplay_task_start' : 'roleplay_task_complete', properties);
  }

  /**
   * Track Drill session
   */
  trackDrillSession(
    action: 'start' | 'complete',
    properties: {
      deckId: string;
      cardsCount?: number;
      masteredCards?: number;
      duration?: number;
    }
  ): void {
    this.track(action === 'start' ? 'drill_session_start' : 'drill_session_complete', properties);
  }

  /**
   * Track character events
   */
  trackCharacter(action: 'created' | 'updated' | 'deleted', characterId: string): void {
    const eventMap = {
      created: 'character_created',
      updated: 'character_updated',
      deleted: 'character_deleted',
    };
    this.track(eventMap[action] as EventName, { characterId });
  }

  /**
   * Track cross-feature event
   */
  trackCrossFeature(eventName: string, properties?: EventProperties): void {
    this.track(eventName as EventName, properties);
  }

  /**
   * Track errors
   */
  trackError(error: Error, context?: string): void {
    this.track('error_occurred', {
      errorMessage: error.message,
      errorStack: error.stack,
      source: context,
    });

    // Also send to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      const Sentry = (
        window as Window & {
          Sentry?: {
            captureException: (error: Error, options?: { extra?: Record<string, unknown> }) => void;
          };
        }
      ).Sentry;
      if (Sentry) {
        Sentry.captureException(error, {
          extra: { context },
        });
      }
    }
  }

  /**
   * Set user properties
   */
  setUser(userId: string, properties?: Record<string, string | number | boolean>): void {
    if (!this.enabled) return;

    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
      if (gtag) {
        gtag('set', {
          user_id: userId,
          ...properties,
        });
      }
    }
  }

  /**
   * Send event to backend for custom analytics
   */
  private async sendToBackend(eventData: {
    event: EventName;
    properties: EventProperties;
  }): Promise<void> {
    if (!this.enabled || typeof window === 'undefined') return;

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      // Silently fail - don't interrupt user experience
      if (this.debugMode) {
        console.error('Failed to send analytics:', error);
      }
    }
  }

  /**
   * Timing utilities
   */
  startTiming(label: string): () => void {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      this.track('page_view', {
        label,
        value: duration,
      });
    };
  }
}

// Export singleton instance
export const analytics = Analytics.getInstance();

// Export convenience functions
export const trackEvent = (eventName: EventName, properties?: EventProperties) =>
  analytics.track(eventName, properties);

export const trackPageView = (pagePath: string, pageTitle?: string) =>
  analytics.pageView(pagePath, pageTitle);

export const trackNavigation = (from: string, to: string) => analytics.trackNavigation(from, to);

export const trackError = (error: Error, context?: string) => analytics.trackError(error, context);

export const setUser = (userId: string, properties?: Record<string, string | number | boolean>) =>
  analytics.setUser(userId, properties);

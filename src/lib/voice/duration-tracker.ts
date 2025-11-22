import { UsageType } from '@prisma/client';
import { getCreditCost } from '@/lib/subscription';

/**
 * VoiceDurationTracker - Tracks voice/realtime session duration for credit calculation
 */
export class VoiceDurationTracker {
  private startTime: number | null = null;
  private pausedTime: number | null = null;
  private totalPausedDuration: number = 0;
  private isRunning: boolean = false;

  /**
   * Start tracking duration
   */
  start(): void {
    if (this.isRunning) return;

    this.startTime = Date.now();
    this.isRunning = true;
    this.pausedTime = null;
  }

  /**
   * Pause tracking
   */
  pause(): void {
    if (!this.isRunning || this.pausedTime !== null) return;

    this.pausedTime = Date.now();
  }

  /**
   * Resume tracking after pause
   */
  resume(): void {
    if (!this.isRunning || this.pausedTime === null) return;

    this.totalPausedDuration += Date.now() - this.pausedTime;
    this.pausedTime = null;
  }

  /**
   * Stop tracking and get final duration
   */
  stop(): { durationSeconds: number; durationMinutes: number } {
    if (!this.isRunning || this.startTime === null) {
      return { durationSeconds: 0, durationMinutes: 0 };
    }

    // If paused, add remaining pause time
    if (this.pausedTime !== null) {
      this.totalPausedDuration += Date.now() - this.pausedTime;
    }

    const totalDuration = Date.now() - this.startTime - this.totalPausedDuration;
    const durationSeconds = Math.max(0, Math.ceil(totalDuration / 1000));
    const durationMinutes = Math.ceil(durationSeconds / 60);

    // Reset state
    this.isRunning = false;
    this.startTime = null;
    this.pausedTime = null;
    this.totalPausedDuration = 0;

    return { durationSeconds, durationMinutes };
  }

  /**
   * Get current duration without stopping
   */
  getCurrentDuration(): { durationSeconds: number; durationMinutes: number } {
    if (!this.isRunning || this.startTime === null) {
      return { durationSeconds: 0, durationMinutes: 0 };
    }

    let pausedDuration = this.totalPausedDuration;
    if (this.pausedTime !== null) {
      pausedDuration += Date.now() - this.pausedTime;
    }

    const totalDuration = Date.now() - this.startTime - pausedDuration;
    const durationSeconds = Math.max(0, Math.ceil(totalDuration / 1000));
    const durationMinutes = Math.ceil(durationSeconds / 60);

    return { durationSeconds, durationMinutes };
  }

  /**
   * Get estimated credits that will be used
   */
  getEstimatedCredits(type: 'standard' | 'realtime'): number {
    const { durationSeconds } = this.getCurrentDuration();
    const usageType = type === 'standard' ? UsageType.VOICE_STANDARD : UsageType.REALTIME;
    return getCreditCost(usageType, durationSeconds);
  }

  /**
   * Check if tracker is currently running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Check if tracker is paused
   */
  isPaused(): boolean {
    return this.isRunning && this.pausedTime !== null;
  }
}

/**
 * Create a new duration tracker instance
 */
export function createDurationTracker(): VoiceDurationTracker {
  return new VoiceDurationTracker();
}

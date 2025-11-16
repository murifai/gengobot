interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

class MemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check rate limit for a given key
   * @param key - Unique identifier (e.g., "login:user@example.com")
   * @param maxAttempts - Maximum allowed attempts
   * @param windowMs - Time window in milliseconds
   * @returns Result with success status and remaining attempts
   */
  async limit(key: string, maxAttempts: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key);

    // First attempt or expired window
    if (!entry || entry.resetAt < now) {
      const resetAt = now + windowMs;
      this.store.set(key, {
        count: 1,
        resetAt,
      });
      return {
        success: true,
        remaining: maxAttempts - 1,
        resetAt,
      };
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxAttempts) {
      return {
        success: false,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    return {
      success: true,
      remaining: maxAttempts - entry.count,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Reset rate limit for a specific key (useful for successful actions)
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[RATE_LIMIT] Cleaned up ${cleaned} expired entries`);
    }
  }

  /**
   * Get current status for debugging
   */
  getStatus(key: string): RateLimitEntry | null {
    return this.store.get(key) || null;
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Singleton instance
export const rateLimiter = new MemoryRateLimiter();

// Convenience functions for different rate limit types

/**
 * Login rate limit: 5 attempts per 15 minutes per email
 */
export async function loginRateLimit(email: string): Promise<RateLimitResult> {
  return rateLimiter.limit(
    `login:${email.toLowerCase()}`,
    5, // 5 attempts
    15 * 60 * 1000 // 15 minutes
  );
}

/**
 * Registration rate limit: 3 attempts per hour per IP
 */
export async function registerRateLimit(ip: string): Promise<RateLimitResult> {
  return rateLimiter.limit(
    `register:${ip}`,
    3, // 3 attempts
    60 * 60 * 1000 // 1 hour
  );
}

/**
 * Password reset rate limit: 3 attempts per hour per email
 */
export async function resetPasswordRateLimit(email: string): Promise<RateLimitResult> {
  return rateLimiter.limit(
    `reset:${email.toLowerCase()}`,
    3, // 3 attempts
    60 * 60 * 1000 // 1 hour
  );
}

/**
 * Email verification resend rate limit: 5 resends per hour per email
 */
export async function verifyEmailRateLimit(email: string): Promise<RateLimitResult> {
  return rateLimiter.limit(
    `verify:${email.toLowerCase()}`,
    5, // 5 resends
    60 * 60 * 1000 // 1 hour
  );
}

/**
 * Helper to format time remaining in human-readable format
 */
export function formatTimeRemaining(resetAt: number): string {
  const minutes = Math.ceil((resetAt - Date.now()) / 60000);
  if (minutes < 1) return 'less than a minute';
  if (minutes === 1) return '1 minute';
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours > 1 ? 's' : ''}`;
}

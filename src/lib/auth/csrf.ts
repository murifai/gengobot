import { createHash, randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash CSRF token for storage in cookie
 */
export function hashCSRFToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Validate CSRF token from request
 * @param request - HTTP request with headers
 * @returns true if valid, false otherwise
 */
export function validateCSRF(request: Request): boolean {
  // Get token from header
  const csrfHeader = request.headers.get('x-csrf-token');

  // Get hashed token from cookie
  const cookies = request.headers.get('cookie');
  const csrfCookie = cookies?.match(/csrf-token=([^;]+)/)?.[1];

  if (!csrfHeader || !csrfCookie) {
    return false;
  }

  // Compare hashed values (constant-time comparison)
  return hashCSRFToken(csrfHeader) === csrfCookie;
}

/**
 * Set CSRF cookie in response
 */
export function setCSRFCookie(token: string): string {
  const hashedToken = hashCSRFToken(token);
  const maxAge = 60 * 60 * 24; // 24 hours

  return `csrf-token=${hashedToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

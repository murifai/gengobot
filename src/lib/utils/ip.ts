/**
 * Extract real IP address from request headers
 * Handles various proxy configurations (Cloudflare, Nginx, etc.)
 */
export function getClientIp(request: Request): string {
  // Check common headers in order of reliability
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2, ...)
    // The first one is the original client IP
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Fallback (shouldn't happen in production)
  return 'unknown';
}

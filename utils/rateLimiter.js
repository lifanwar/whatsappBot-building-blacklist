// utils/rateLimiter.js

const userLastRequest = new Map();
const RATE_LIMIT_MS = 60 * 1000; // 1 menit

/**
 * Check apakah user boleh request
 * @returns {boolean} true jika boleh, false jika masih cooldown
 */
export function canUserRequest(userId) {
  const now = Date.now();
  const lastRequest = userLastRequest.get(userId);

  if (!lastRequest) {
    userLastRequest.set(userId, now);
    return true;
  }

  const timeSinceLastRequest = now - lastRequest;

  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    return false;
  }

  userLastRequest.set(userId, now);
  return true;
}

/**
 * Get remaining cooldown time
 * @returns {number} seconds remaining
 */
export function getRemainingCooldown(userId) {
  const now = Date.now();
  const lastRequest = userLastRequest.get(userId);

  if (!lastRequest) return 0;

  const timeSinceLastRequest = now - lastRequest;
  const remaining = RATE_LIMIT_MS - timeSinceLastRequest;

  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

// Cleanup old entries setiap 5 menit
setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamp] of userLastRequest.entries()) {
    if (now - timestamp > RATE_LIMIT_MS * 5) {
      userLastRequest.delete(userId);
    }
  }
}, 5 * 60 * 1000);

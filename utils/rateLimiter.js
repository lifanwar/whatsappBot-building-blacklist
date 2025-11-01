// utils/rateLimiter.js

const userLastRequest = new Map();

// Ambil rate limit dari .env (dalam menit)
const RATE_LIMIT_MINUTES = parseInt(process.env.RATE_LIMIT_MINUTES) || 1;
const RATE_LIMIT_MS = RATE_LIMIT_MINUTES * 60 * 1000;

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

export function getRemainingCooldown(userId) {
  const now = Date.now();
  const lastRequest = userLastRequest.get(userId);

  if (!lastRequest) return 0;

  const timeSinceLastRequest = now - lastRequest;
  const remaining = RATE_LIMIT_MS - timeSinceLastRequest;

  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

// Cleanup old entries
setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamp] of userLastRequest.entries()) {
    if (now - timestamp > RATE_LIMIT_MS * 5) {
      userLastRequest.delete(userId);
    }
  }
}, 5 * 60 * 1000);

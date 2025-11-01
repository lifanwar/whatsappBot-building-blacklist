// handlers/coordinateHandler.js

import { searchBlacklistByShareLocation } from '../commands/blacklist/index.js';
import { blacklistMessages } from '../commands/blacklist/index.js';
import { canUserRequest, getRemainingCooldown } from '../utils/rateLimiter.js';

/**
 * Parse koordinat dari text
 * Format: "lat, lon" atau "lat,lon"
 */
export function parseCoordinates(text) {
  if (!text || typeof text !== 'string') return null;

  const match = text.trim().match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (!match) return null;

  const lat = parseFloat(match[1]);
  const lon = parseFloat(match[2]);

  // Validate range
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }

  return { latitude: lat, longitude: lon };
}

/**
 * Handle coordinate message (same flow as locationHandler)
 */
export async function handleCoordinateMessage(sock, sender, preferredJid, coordinates) {
  console.log('[COORDINATE] Received from', sender);

  // Rate limit check
  if (!canUserRequest(sender)) {
    const remaining = getRemainingCooldown(sender);
    await sock.sendMessage(preferredJid, {
      text: blacklistMessages.rateLimited(remaining)
    });
    return;
  }

  // Loading message
  const loadingMsg = await sock.sendMessage(preferredJid, {
    text: blacklistMessages.searching()
  });

  // Search (reuse existing logic)
  const result = await searchBlacklistByShareLocation(
    coordinates.latitude,
    coordinates.longitude
  );

  // Format response
  let responseText;
  if (!result.success) {
    responseText = blacklistMessages.error();
  } else if (result.results.length === 0) {
    responseText = blacklistMessages.noResults();
  } else {
    responseText = blacklistMessages.formatResults(result.results);
  }

  // Update message
  await sock.sendMessage(preferredJid, {
    text: responseText
  }, { edit: loadingMsg.key });
}

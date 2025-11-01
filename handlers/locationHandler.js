// handlers/locationHandler.js

import { searchBlacklistByShareLocation } from '../commands/blacklist/index.js';
import { blacklistMessages } from '../commands/blacklist/index.js';
import { canUserRequest, getRemainingCooldown } from '../utils/rateLimiter.js';

/**
 * Handle location message
 */
export async function handleLocationMessage(sock, sender, preferredJid, location) {
  console.log(`[LOCATION] Received from ${sender}`);
  
  // Check rate limit
  if (!canUserRequest(sender)) {
    const remaining = getRemainingCooldown(sender);
    await sock.sendMessage(preferredJid, {
      text: blacklistMessages.rateLimited(remaining)
    });
    return;
  }
  
  // Send loading message
  const loadingMsg = await sock.sendMessage(preferredJid, {
    text: blacklistMessages.searching()
  });
  
  // Search blacklist
  const result = await searchBlacklistByShareLocation(
    location.latitude,
    location.longitude
  );
  
  let responseText;
  
  if (!result.success) {
    responseText = blacklistMessages.error();
  } else if (result.results.length === 0) {
    responseText = blacklistMessages.noResults();
  } else {
    responseText = blacklistMessages.formatResults(result.results);
  }
  
  // Update loading message with result
  await sock.sendMessage(preferredJid, {
    text: responseText,
    edit: loadingMsg.key
  });
}

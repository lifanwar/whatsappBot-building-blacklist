// utils/whatsappHelpers.js

import { isPnUser, isJidGroup } from '@whiskeysockets/baileys';

/**
 * WhatsApp helper functions
 * EXACT COPY dari index.js - TIDAK ADA PERUBAHAN!
 */

export function isLidUser(jid) {
  return jid?.endsWith('@lid');
}

export function isPrivateChat(jid) {
  return isPnUser(jid) || isLidUser(jid);
}

export function getSenderIdentifier(jid, jidAlt) {
  if (isLidUser(jid) && jidAlt && isPnUser(jidAlt)) {
    return jidAlt;
  }
  return jid;
}

export function getPreferredJid(jid, jidAlt) {
  return jid;
}

export function extractLocation(message) {
  // Location message
  if (message.message?.locationMessage) {
    const loc = message.message.locationMessage;
    return {
      latitude: loc.degreesLatitude,
      longitude: loc.degreesLongitude,
      name: loc.name || 'Unknown'
    };
  }
  
  // Live location message
  if (message.message?.liveLocationMessage) {
    const loc = message.message.liveLocationMessage;
    return {
      latitude: loc.degreesLatitude,
      longitude: loc.degreesLongitude,
      name: 'Live Location',
      isLive: true
    };
  }
  
  return null;
}

// handlers/commandHandler.js

import { blacklistMessages } from '../commands/blacklist/index.js';
import { templateMessages } from '../utils/messageTemplates.js';

/**
 * Handle text commands
 * EXACT LOGIC dari index.js - TIDAK ADA PERUBAHAN!
 */
export async function handleTextCommand(sock, preferredJid, text, message) {
  const command = text.toLowerCase();
  
  // Command: ping
  if (command === 'p') {
    await sock.sendMessage(preferredJid, {
      text: templateMessages.ping()
    }, {
      quoted: message
    });
  }
  
  // Command: helpBlacklist
  if (command === 'help' || command === 'menu') {
    await sock.sendMessage(preferredJid, {
      text: blacklistMessages.help()
    });
  }
}

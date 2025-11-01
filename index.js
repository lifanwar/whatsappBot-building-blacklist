// index.js
import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  Browsers,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  isPnUser,
  isJidGroup
} from '@whiskeysockets/baileys';

import fs from 'fs';
import express from 'express';
import path from 'path';
import pino from 'pino';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import modules
import { searchBlacklistByShareLocation } from './commands/blacklist/index.js';
import { canUserRequest, getRemainingCooldown } from './utils/rateLimiter.js';

// import messages
import { blacklistMessages } from './commands/blacklist/index.js';

// Setup __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Logger
const logger = pino({ level: 'silent' });

// Express server untuk QR
const app = express();
const PORT = parseInt(process.env.PORT);
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// ===== HELPER FUNCTIONS =====

function isLidUser(jid) {
  return jid?.endsWith('@lid');
}

function isPrivateChat(jid) {
  return isPnUser(jid) || isLidUser(jid);
}

function getSenderIdentifier(jid, jidAlt) {
  if (isLidUser(jid) && jidAlt && isPnUser(jidAlt)) {
    return jidAlt;
  }
  return jid;
}

function getPreferredJid(jid, jidAlt) {
  return jid;
}

function extractLocation(message) {
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

let sock;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("session1");
  
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`Using WA v${version.join(".")}, latest: ${isLatest}`);
  
  sock = makeWASocket({
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    version,
    browser: Browsers.macOS("Desktop"),
    logger: logger,
    getMessage: async (key) => undefined
  });
  
  // Connection handler
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      let htmlTemplate = fs.readFileSync(path.join(__dirname, 'src', 'index.html'), 'utf8');
      htmlTemplate = htmlTemplate.replace('{{QR_CODE_PLACEHOLDER}}',
        `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=300x300`);
      htmlTemplate = htmlTemplate.replace('{{CURRENT_YEAR}}', new Date().getFullYear());
      
      app.get("/", (req, res) => res.send(htmlTemplate));
    }
    
    if (connection === "close") {
      server.close();
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Connection closed, reconnecting:", shouldReconnect);
      
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("Connection opened");
    }
  });
  
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("lid-mapping.update", (mapping) => {
    console.log("LID mapping updated:", mapping);
  });
  
  // ===== MESSAGE HANDLER =====
  sock.ev.on('messages.upsert', async ({ type, messages: msgs }) => {
    if (type !== "notify") return;
    
    for (const message of msgs) {
      if (!message.message) continue;
      if (message.key.fromMe) continue;
      
      const chatJid = message.key.remoteJid;
      const chatJidAlt = message.key.remoteJidAlt;
      
      const isGroup = isJidGroup(chatJid);
      const isPrivate = isPrivateChat(chatJid);
      
      // Hanya handle private chat
      if (!isPrivate) continue;
      
      const sender = getSenderIdentifier(chatJid, chatJidAlt);
      const preferredJid = getPreferredJid(chatJid, chatJidAlt);
      
      // Extract location
      const location = extractLocation(message);
      
      // ===== HANDLE LOCATION (AUTO SEARCH) =====
      if (location) {
        console.log(`[LOCATION] Received from ${sender}`);
        
        // Check rate limit
        if (!canUserRequest(sender)) {
          const remaining = getRemainingCooldown(sender);
          await sock.sendMessage(preferredJid, {
            text: blacklistMessages.rateLimited(remaining)
          });
          continue;
        }
        
        // Send loading message
        const loadingMsg = await sock.sendMessage(preferredJid, {
          text: blacklistMessages.searching()
        });
        
        // Search blacklist
        const result = await searchBlacklistByShareLocation(
          location.latitude,
          location.longitude,
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
        
        continue;
      }
      
      // ===== HANDLE TEXT COMMANDS =====
      const messageContent = 
        message.message.conversation || 
        message.message.extendedTextMessage?.text || 
        '';
      
      const text = messageContent.trim().toLowerCase();
      
      // Command: ping
      if (text === 'p') {
        await sock.sendMessage(preferredJid, {
          text: "pong"
        }, {
          quoted: message
        });
      }
      
      // Command: help blacklist
      else if (text === 'help' || text === 'menu') {
        await sock.sendMessage(preferredJid, {
          text: blacklistMessages.help()
        });
      }
    }
  });
}

// Start bot
connectToWhatsApp();

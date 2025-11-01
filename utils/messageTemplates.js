// utils/messageTemplates.js

/**
 * Shared Templates command messages
 */

export const templateMessages = {
    ping: () => 
      `pong`,
  
    help: () => {
      const RATE_LIMIT_MINUTES = parseInt(process.env.RATE_LIMIT_MINUTES) || 1;
      
      return `🏠 *BLACKLIST PROPERTY BOT*\n\n` +
             `Untuk mencari gedung blacklist:\n` +
             `📍 Kirim *Share Location* Anda\n\n` +
             `Bot akan otomatis mencari gedung bermasalah dalam radius ${SEARCH_RADIUS}m dari lokasi Anda.\n\n` +
             `⏰ Rate limit: 1 x per ${RATE_LIMIT_MINUTES} menit\n` +
             `\n━━━━━━━━━━━━━━━━━\n` +
             `_Bot ini membantu Anda menghindari properti bermasalah_`;
    }
  };
  
  export default templateMessages;
  

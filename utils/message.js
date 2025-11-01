// utils/message.js

// Ambil config dari .env
const SEARCH_RADIUS = parseInt(process.env.SEARCH_RADIUS) || 1000;
const MAX_RESULTS = parseInt(process.env.MAX_RESULTS_PER_GEDUNG) || 3;
const radiusKm = SEARCH_RADIUS / 1000;

export const messages = {
  rateLimited: (seconds) => 
    `⏰ *Mohon tunggu ${seconds} detik*\n\nAnda baru saja melakukan pencarian. Silakan coba lagi setelah cooldown selesai.`,

  searching: () => 
    `🔍 *Mencari gedung blacklist...*\n\nSedang mengecek dalam radius ${radiusKm}km dari lokasi Anda...`,

  noResults: () => 
    `✅ *Tidak ada gedung blacklist*\n\nTidak ditemukan gedung bermasalah dalam radius ${radiusKm}km dari lokasi Anda.\n\n_Ini kabar baik! Area ini aman._`,

  formatResults: (results) => {
    let message = `⚠️ *DAFTAR BLACKLIST TERDEKAT*\n\n`;
    message += `Ditemukan *${results.length} gedung* dengan masalah dalam radius ${radiusKm}km:\n\n`;

    results.forEach((gedung, index) => {
      message += `━━━━━━━━━━━━━━━\n`;
      message += `*${index + 1}. ${gedung.nama_gedung || 'Gedung Tanpa Nama'}*\n\n`;
      message += `📍 ${gedung.alamat}\n`;
      message += `🗺️ ${gedung.lokasi.distrik} - ${gedung.lokasi.lokasi_name}\n`;
      message += `📏 Jarak: *${gedung.distanceText}*\n`;
      message += `⚠️ Unit Bermasalah: *${gedung.units.length}*\n\n`;

      const maxUnits = Math.min(MAX_RESULTS, gedung.units.length);
      message += `*Daftar Unit:*\n`;
      
      for (let i = 0; i < maxUnits; i++) {
        const unit = gedung.units[i];
        message += `${i + 1}. ${unit.unit_number || 'N/A'}\n`;
        message += `   👤 ${unit.pemilik || unit.agen || 'N/A'}\n`;
        message += `   ⚠️ ${unit.alasan || 'Tidak ada keterangan'}\n`;
        if (unit.harga) {
          message += `   💰 ${unit.harga} ${unit.currency}/${unit.periode}\n`;
        }
        message += `\n`;
      }

      if (gedung.units.length > maxUnits) {
        message += `_...dan ${gedung.units.length - maxUnits} unit lainnya_\n\n`;
      }

      message += `🗺️ https://maps.google.com/?q=${gedung.lat},${gedung.lng}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━\n`;
    message += `_Data ini membantu Anda menghindari properti bermasalah_`;

    return message;
  },

  error: () => 
    `❌ *Terjadi Kesalahan*\n\nGagal mengambil data. Silakan coba lagi nanti.`
};

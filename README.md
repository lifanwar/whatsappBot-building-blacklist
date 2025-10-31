<div align="center">

# 🏠 Blacklist Property Bot

### WhatsApp Bot untuk Deteksi Properti Bermasalah

[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

*Lindungi diri Anda dari properti bermasalah dengan location-based search*

![Bot Demo](https://via.placeholder.com/800x400/1a1a1a/00ff00?text=Demo+Screenshot)

</div>

---

## 🎯 Tentang Project

**Blacklist Property Bot** adalah WhatsApp bot berbasis lokasi yang membantu pengguna mendeteksi properti (rumah, apartemen) dengan riwayat bermasalah dalam radius tertentu dari lokasi mereka. Bot ini menggunakan teknologi geospatial dan database optimization untuk memberikan hasil pencarian yang **cepat** dan **akurat**.

### 🚨 Problem yang Diselesaikan

- 🏚️ **Penyewa dirugikan** oleh pemilik properti yang tidak bertanggung jawab
- 💰 **Kehilangan deposit** tanpa alasan jelas
- 🔧 **Maintenance diabaikan** oleh pemilik
- 📜 **Kontrak berubah-ubah** tanpa kesepakatan
- ⚠️ **Tidak ada sistem peringatan** sebelum menyewa

### ✅ Solusi yang Ditawarkan

Bot ini memberikan **early warning system** untuk calon penyewa dengan:
- ✨ Search properti blacklist **dalam hitungan detik**
- 📍 Location-based search (1km radius)
- 🗺️ Detail lengkap (alamat, pemilik, alasan blacklist, harga)
- 🔒 Rate limiting untuk prevent abuse
- 📊 Data terstruktur dengan PostgreSQL + optimization

---

## ✨ Features

### Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| 📍 **Geospatial Search** | Cari properti blacklist berdasarkan koordinat GPS | ✅ Live |
| 🎯 **Bounding Box Optimization** | Query optimization dengan spatial indexing | ✅ Live |
| ⚡ **Fast Response** | < 100ms untuk 10,000+ data | ✅ Live |
| 🔐 **Rate Limiting** | 1 request/menit per user | ✅ Live |
| 📊 **Detailed Reports** | Info lengkap: pemilik, agen, alasan, harga | ✅ Live |
| 🗺️ **Google Maps Integration** | Direct link ke lokasi properti | ✅ Live |

### Technical Features

- 🚀 **Composite Indexing** - Optimized PostgreSQL queries
- 🔄 **Haversine Formula** - Accurate distance calculation
- 📦 **Modular Architecture** - Easy to maintain & extend
- 🛡️ **Error Handling** - Comprehensive try-catch blocks
- 📝 **Detailed Logging** - Debug-friendly console logs
- 🌐 **REST API Ready** - Supabase integration

---

<div align="center">

**Made with ❤️ and ☕**

</div>

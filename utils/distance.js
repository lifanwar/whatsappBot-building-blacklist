// utils/distance.js

/**
 * Hitung jarak antara 2 koordinat (Haversine formula)
 * @returns distance in meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
  
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c;
  }
  
  /**
   * Format distance untuk display
   */
  export function formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  }
  
  /**
   * Hitung bounding box untuk filter database
   * Optimasi: hanya ambil data dalam kotak, bukan semua data
   */
  export function getBoundingBox(lat, lon, radiusInMeters) {
    const latDelta = radiusInMeters / 111320; // 1 derajat lat ≈ 111.32km
    const lonDelta = radiusInMeters / (111320 * Math.cos(lat * Math.PI / 180));
  
    return {
      minLat: lat - latDelta,
      maxLat: lat + latDelta,
      minLon: lon - lonDelta,
      maxLon: lon + lonDelta
    };
  }
  
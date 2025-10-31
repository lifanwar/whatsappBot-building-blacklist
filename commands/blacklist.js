// commands/blacklist.js
import { supabase } from '../config/supabase.js';
import { calculateDistance, formatDistance, getBoundingBox } from '../utils/distance.js';

// Ambil radius dari .env
const SEARCH_RADIUS = parseInt(process.env.SEARCH_RADIUS) || 1000;

/**
 * Search blacklist berdasarkan lokasi dengan optimasi query
 * OPTIMASI: Filter dulu dengan bounding box, baru hitung jarak exact
 */
export async function searchBlacklistByLocation(userLat, userLng, radiusInMeters = SEARCH_RADIUS) {
  try {
    const bbox = getBoundingBox(userLat, userLng, radiusInMeters);

    console.log(`[SEARCH] User location: ${userLat}, ${userLng}`);
    console.log(`[SEARCH] Radius: ${radiusInMeters}m`);
    console.log(`[SEARCH] Bounding box:`, bbox);

    // Query gedung dalam bounding box
    const { data: gedungData, error: gedungError } = await supabase
      .from('gedung')
      .select(`
        id,
        lat,
        lng,
        alamat,
        nama_gedung,
        lokasi:lokasi_id (
          distrik,
          lokasi_name
        )
      `)
      .gte('lat', bbox.minLat)
      .lte('lat', bbox.maxLat)
      .gte('lng', bbox.minLon)
      .lte('lng', bbox.maxLon);

    if (gedungError) {
      console.error('[SEARCH] Error fetching gedung:', gedungError);
      throw gedungError;
    }

    console.log(`[SEARCH] Found ${gedungData?.length || 0} gedung in bounding box`);

    if (!gedungData || gedungData.length === 0) {
      return { success: true, results: [] };
    }

    // Filter exact dengan Haversine formula
    const gedungInRadius = gedungData
      .map(gedung => {
        const distance = calculateDistance(userLat, userLng, gedung.lat, gedung.lng);
        console.log(`[SEARCH] ${gedung.nama_gedung || 'Unknown'}: ${distance.toFixed(2)}m`);
        return { ...gedung, distance };
      })
      .filter(gedung => gedung.distance <= radiusInMeters)
      .sort((a, b) => a.distance - b.distance);

    console.log(`[SEARCH] ${gedungInRadius.length} gedung within ${radiusInMeters}m radius`);

    if (gedungInRadius.length === 0) {
      return { success: true, results: [] };
    }

    // Ambil units blacklist
    const gedungIds = gedungInRadius.map(g => g.id);

    const { data: unitsData, error: unitsError } = await supabase
      .from('units')
      .select('*')
      .in('gedung_id', gedungIds)
      .eq('listing_type', 'blacklist')
      .eq('status', 'active');

    if (unitsError) {
      console.error('[SEARCH] Error fetching units:', unitsError);
      throw unitsError;
    }

    console.log(`[SEARCH] Found ${unitsData?.length || 0} blacklist units`);

    // Gabungkan data
    const results = gedungInRadius
      .map(gedung => {
        const units = unitsData.filter(u => u.gedung_id === gedung.id);
        
        if (units.length === 0) return null;

        return {
          ...gedung,
          distanceText: formatDistance(gedung.distance),
          units
        };
      })
      .filter(Boolean);

    console.log(`[SEARCH] Final result: ${results.length} gedung with blacklist units`);

    return {
      success: true,
      results
    };

  } catch (error) {
    console.error('[SEARCH] Unexpected error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

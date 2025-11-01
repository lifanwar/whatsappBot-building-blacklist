// commands/blacklist/helpers/filterGedung.js

import { supabase } from '../../../config/supabase.js';
import { calculateDistance, getBoundingBox } from '../../../utils/distance.js';

/**
 * Filter gedung berdasarkan radius (bounding box + Haversine)
 * LOGIC SAMA PERSIS dengan yang original!
 */
export async function filterGedungByRadius(userLat, userLng, radiusInMeters) {
  // 1. Calculate bounding box
  const bbox = getBoundingBox(userLat, userLng, radiusInMeters);

  console.log(`[SEARCH] User location: ${userLat}, ${userLng}`);
  console.log(`[SEARCH] Radius: ${radiusInMeters}m`);
  console.log(`[SEARCH] Bounding box:`, bbox);

  // 2. Query gedung dalam bounding box
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
    return [];
  }

  // 3. Filter exact dengan Haversine formula
  const gedungInRadius = gedungData
    .map(gedung => {
      const distance = calculateDistance(userLat, userLng, gedung.lat, gedung.lng);
      console.log(`[SEARCH] ${gedung.nama_gedung || 'Unknown'}: ${distance.toFixed(2)}m`);
      return { ...gedung, distance };
    })
    .filter(gedung => gedung.distance <= radiusInMeters)
    .sort((a, b) => a.distance - b.distance);

  console.log(`[SEARCH] ${gedungInRadius.length} gedung within ${radiusInMeters}m radius`);

  return gedungInRadius;
}

// commands/blacklist/searchByShareLocation.js

import { filterGedungByRadius } from './helpers/filterGedung.js';
import { fetchBlacklistUnits } from './helpers/fetchUnits.js';
import { mergeGedungWithUnits } from './helpers/mergeResults.js';

// Ambil radius dari .env
const SEARCH_RADIUS = parseInt(process.env.SEARCH_RADIUS) || 1000;

/**
 * Search blacklist berdasarkan lokasi dengan optimasi query
 * OPTIMASI: Filter dulu dengan bounding box, baru hitung jarak exact
 * 
 * LOGIC SAMA PERSIS dengan original, hanya di-split ke helper functions!
 */
export async function searchBlacklistByShareLocation(userLat, userLng, radiusInMeters = SEARCH_RADIUS) {
  try {
    // Step 1: Filter gedung by radius
    const gedungInRadius = await filterGedungByRadius(userLat, userLng, radiusInMeters);

    if (gedungInRadius.length === 0) {
      return { success: true, results: [] };
    }

    // Step 2: Ambil units blacklist
    const gedungIds = gedungInRadius.map(g => g.id);
    const unitsData = await fetchBlacklistUnits(gedungIds);

    // Step 3: Gabungkan data
    const results = mergeGedungWithUnits(gedungInRadius, unitsData);

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

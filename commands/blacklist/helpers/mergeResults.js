// commands/blacklist/helpers/mergeResults.js

import { formatDistance } from '../../../utils/distance.js';

/**
 * Merge gedung dengan units
 * LOGIC SAMA PERSIS dengan yang original!
 */
export function mergeGedungWithUnits(gedungInRadius, unitsData) {
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

  return results;
}

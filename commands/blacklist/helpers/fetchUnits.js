// commands/blacklist/helpers/fetchUnits.js

import { supabase } from '../../../config/supabase.js';

/**
 * Fetch units blacklist untuk gedung IDs
 * LOGIC SAMA PERSIS dengan yang original!
 */
export async function fetchBlacklistUnits(gedungIds) {
  if (!gedungIds || gedungIds.length === 0) {
    return [];
  }

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

  return unitsData || [];
}

// test-supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function testConnection() {
  console.log('Testing Supabase connection...\n');

  // Test 1: Count lokasi
  const { data: lokasi, error: lokasiError } = await supabase
    .from('lokasi')
    .select('*');
  
  if (lokasiError) {
    console.error('❌ Error lokasi:', lokasiError);
  } else {
    console.log('✅ Lokasi:', lokasi.length, 'rows');
  }

  // Test 2: Count gedung
  const { data: gedung, error: gedungError } = await supabase
    .from('gedung')
    .select('*');
  
  if (gedungError) {
    console.error('❌ Error gedung:', gedungError);
  } else {
    console.log('✅ Gedung:', gedung.length, 'rows');
  }

  // Test 3: Count units blacklist
  const { data: units, error: unitsError } = await supabase
    .from('units')
    .select('*')
    .eq('listing_type', 'blacklist')
    .eq('status', 'active');
  
  if (unitsError) {
    console.error('❌ Error units:', unitsError);
  } else {
    console.log('✅ Blacklist units:', units.length, 'rows');
  }

  // Test 4: Test bounding box query
  console.log('\n--- Testing Bounding Box Query ---');
  
  const testLat = 30.056;
  const testLng = 31.370;
  const radius = 1000; // 1km for testing
  
  const latDelta = radius / 111320;
  const lonDelta = radius / (111320 * Math.cos(testLat * Math.PI / 180));

  const { data: gedungInBox, error: boxError } = await supabase
    .from('gedung')
    .select(`
      id,
      lat,
      lng,
      nama_gedung,
      alamat
    `)
    .gte('lat', testLat - latDelta)
    .lte('lat', testLat + latDelta)
    .gte('lng', testLng - lonDelta)
    .lte('lng', testLng + lonDelta);

  if (boxError) {
    console.error('❌ Error bounding box:', boxError);
  } else {
    console.log('✅ Gedung in bounding box:', gedungInBox.length);
    gedungInBox.forEach(g => {
      console.log(`  - ${g.nama_gedung}`);
    });
  }

  console.log('\n✅ All tests completed!');
}

testConnection();

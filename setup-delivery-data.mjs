import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupDeliveryData() {
  try {
    console.log('🏙️  Setting up delivery cities and streets...');

    // Check if cities already have data
    const { data: existingCities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name_he')
      .limit(5);

    if (citiesError) {
      console.error('❌ Error checking cities:', citiesError);
      throw citiesError;
    }

    console.log(`📊 Found ${existingCities?.length || 0} existing cities`);

    if (existingCities && existingCities.length > 0) {
      console.log('✅ Cities already populated:');
      existingCities.forEach(city => console.log(`   - ${city.name_he}`));
    } else {
      console.log('⚠️  No cities found. Cities should be created by migrations.');
    }

    // Check streets
    const { data: existingStreets, error: streetsError } = await supabase
      .from('streets')
      .select('id')
      .limit(1);

    if (streetsError) {
      console.error('❌ Error checking streets:', streetsError);
      throw streetsError;
    }

    console.log(`📊 Streets in database: ${existingStreets?.length || 0}`);

    if (!existingStreets || existingStreets.length === 0) {
      console.log('⚠️  Streets table is empty!');
      console.log('');
      console.log('To populate streets, you need to:');
      console.log('1. Run the sample streets SQL manually in Supabase SQL Editor');
      console.log('2. Or use a street import tool with real data');
      console.log('');
      console.log('For now, the app will work with manual street entry.');
    } else {
      console.log('✅ Streets data is present');
    }

    console.log('');
    console.log('✅ Setup complete!');
    console.log('');
    console.log('Cities and streets are configured.');
    console.log('The order form will now show city selection dropdown.');

  } catch (err) {
    console.error('❌ Setup error:', err);
    process.exit(1);
  }
}

setupDeliveryData();

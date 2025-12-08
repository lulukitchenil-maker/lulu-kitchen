#!/usr/bin/env node
/**
 * Streets Import Script for Lulu Chinese Kitchen
 * ----------------------------------------------
 * Imports streets data into Supabase from a CSV file.
 *
 * Usage:
 *   node import-streets.mjs <csv-file-path>
 *   node import-streets.mjs --sample
 *
 * CSV Format:
 *   city_name_he,street_name_he,street_name_en,official_code
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = resolve(__dirname, '.env');
let envContent;
try {
  envContent = readFileSync(envPath, 'utf-8');
} catch (error) {
  console.error('❌ Error: .env file not found');
  process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) env[key.trim()] = valueParts.join('=').trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Delivery settlements
const DELIVERY_CITIES = [
  'ירושלים',
  'מבשרת ציון',
  'אבו גוש',
  'מוצא עילית',
  'מוצא תחתית',
  'מעלה החמישה',
  'קרית יערים',
  'אורה',
  'בית זית',
  'עין ראפה',
  'עין נקובא'
];

// Parse CSV content
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
}

// Ensure a city exists (create if missing)
async function ensureCityExists(cityName) {
  const { data: existing } = await supabase
    .from('cities')
    .select('id')
    .eq('name_he', cityName)
    .maybeSingle();

  if (existing) return existing.id;

  console.log(`🏙️  Creating new city: ${cityName}`);

  const { data, error } = await supabase
    .from('cities')
    .insert([{ name_he: cityName, delivery_enabled: true }])
    .select('id')
    .single();

  if (error) {
    console.error(`❌ Failed to create city ${cityName}: ${error.message}`);
    return null;
  }

  return data.id;
}

// Main import function
async function importStreets(csvFilePath) {
  console.log('🚀 Starting streets import...\n');

  let csvContent;
  try {
    csvContent = readFileSync(csvFilePath, 'utf-8');
    console.log(`✅ Read CSV file: ${csvFilePath}`);
  } catch (error) {
    console.error(`❌ Error reading CSV file: ${error.message}`);
    process.exit(1);
  }

  const rows = parseCSV(csvContent);
  console.log(`📊 Found ${rows.length} streets in CSV\n`);

  // Get existing cities
  const { data: cities, error: citiesError } = await supabase
    .from('cities')
    .select('id, name_he');

  if (citiesError) {
    console.error(`❌ Error fetching cities: ${citiesError.message}`);
    process.exit(1);
  }

  const cityMap = {};
  cities.forEach(city => (cityMap[city.name_he] = city.id));

  let totalImported = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  let citiesAdded = 0;

  const validRows = rows.filter(r => r.city_name_he && r.street_name_he);

  for (const row of validRows) {
    const cityName = row.city_name_he;
    if (!DELIVERY_CITIES.includes(cityName)) continue;

    // Ensure city exists
    let cityId = cityMap[cityName];
    if (!cityId) {
      const newId = await ensureCityExists(cityName);
      if (newId) {
        cityMap[cityName] = newId;
        citiesAdded++;
        cityId = newId;
      } else continue;
    }

    const { error } = await supabase
      .from('streets')
      .upsert(
        {
          city_id: cityId,
          street_name_he: row.street_name_he,
          street_name_en: row.street_name_en || null,
          official_code: row.official_code || null
        },
        { onConflict: 'city_id,street_name_he', ignoreDuplicates: true }
      );

    if (error) {
      if (error.code === '23505') totalSkipped++;
      else {
        console.error(`❌ Error inserting ${row.street_name_he}: ${error.message}`);
        totalErrors++;
      }
    } else {
      totalImported++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`🏙️  Cities added: ${citiesAdded}`);
  console.log(`✅ Streets imported: ${totalImported}`);
  console.log(`⏭️  Skipped (duplicates): ${totalSkipped}`);
  console.log(`❌ Errors: ${totalErrors}`);
  console.log('='.repeat(60));
  console.log('\n✨ Import complete!\n');
}

// Generate sample CSV
function generateSampleCSV() {
  const sample = `city_name_he,street_name_he,street_name_en,official_code
ירושלים,רחוב הרצל,Herzl Street,12345
ירושלים,רחוב יפו,Jaffa Street,12346
מבשרת ציון,רחוב הראשונים,HaRishonim Street,22002`;

  const samplePath = resolve(__dirname, 'sample-streets.csv');
  try {
    writeFileSync(samplePath, sample, 'utf-8');
    console.log(`✅ Sample CSV created: ${samplePath}`);
  } catch (error) {
    console.error(`❌ Error creating sample: ${error.message}`);
  }
}

// CLI handling
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Streets Import Script for Lulu Chinese Kitchen');
  console.log('='.repeat(60));
  console.log('\nUsage:');
  console.log('  node import-streets.mjs <csv-file-path>');
  console.log('  node import-streets.mjs --sample');
  console.log('\nCSV Format:');
  console.log('  city_name_he,street_name_he,street_name_en,official_code');
  console.log('\nDelivery Cities:');
  DELIVERY_CITIES.forEach(c => console.log('  - ' + c));
  console.log('');
  process.exit(0);
}

if (args[0] === '--sample') {
  generateSampleCSV();
} else {
  const csvPath = resolve(process.cwd(), args[0]);
  importStreets(csvPath).catch(err => {
    console.error(`\n❌ Fatal error: ${err.message}`);
    process.exit(1);
  });
}

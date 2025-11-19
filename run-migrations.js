#!/usr/bin/env node

/**
 * Supabase Migration Runner for Lulu Chinese Kitchen
 * --------------------------------------------------
 * Usage:
 *   1. שמור את SERVICE_ROLE_KEY ב־.env:
 *      SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 *   2. שמור את URL ו־SERVICE_ROLE_KEY שלך ב־.env
 *   3. הרץ: node run-migrations.js
 *
 * ⚠️ שימוש ב־SERVICE_ROLE_KEY – לא לשתף קוד עם מפתח זה!
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env manually
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const sqlFilePath = resolve(process.cwd(), 'create_all_missing_tables.sql');

let sql;
try {
  sql = readFileSync(sqlFilePath, 'utf-8');
  console.log(`📄 Loaded SQL file: ${sqlFilePath}`);
} catch (err) {
  console.error(`❌ Failed to read SQL file: ${err.message}`);
  process.exit(1);
}

async function runMigrations() {
  console.log('🔧 Running migrations...');
  
  try {
    const { data, error } = await supabase.rpc('run_sql', { sql });
    
    // supabase.rpc('run_sql') לא תמיד זמין לכל פרויקט – נבדוק אם צריך דרך SQL Editor
    if (error) {
      console.error('❌ Error running SQL:', error.message);
    } else {
      console.log('✅ Migrations completed successfully!');
    }
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
  }
}

runMigrations();

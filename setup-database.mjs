#!/usr/bin/env node

/**
 * Database Setup Script
 *
 * This script runs all database migrations directly using Supabase client.
 * Use this if you cannot access Supabase Dashboard.
 *
 * Usage:
 *   node setup-database.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env file manually
const envFile = readFileSync('.env', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) {
    envVars[key.trim()] = values.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('🔧 Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Connected to:', supabaseUrl);
console.log('');

// Read the combined SQL file
console.log('📄 Reading SQL migrations...');
const sql = readFileSync('./create_all_missing_tables.sql', 'utf-8');

console.log('📊 SQL file size:', sql.length, 'characters');
console.log('📊 SQL lines:', sql.split('\n').length);
console.log('');

console.log('⚠️  IMPORTANT:');
console.log('   This script needs SERVICE ROLE access to run DDL statements.');
console.log('   The ANON KEY cannot create tables or modify schema.');
console.log('');
console.log('❌ Cannot proceed with ANON key.');
console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('                  ALTERNATIVE SOLUTIONS');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('Option 1: Wait for Supabase Support (Recommended)');
console.log('   ✓ Wait for Supabase support to restore your access');
console.log('   ✓ Then run the SQL in Supabase Dashboard');
console.log('');
console.log('Option 2: Use Service Role Key (If you have it)');
console.log('   1. Get your SERVICE_ROLE_KEY from Supabase project settings');
console.log('   2. Add to .env: SUPABASE_SERVICE_ROLE_KEY=your-key');
console.log('   3. Run this script again');
console.log('   ⚠️  NEVER commit service role key to git!');
console.log('');
console.log('Option 3: Manual SQL Execution (When you get access back)');
console.log('   1. Open: https://app.supabase.com/project/bmeyaxprvzltkpochfcp/sql');
console.log('   2. Copy & paste: create_all_missing_tables.sql');
console.log('   3. Click Run');
console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('📋 What the migrations will create:');
console.log('   • orders table - Customer orders');
console.log('   • contact_messages table - Contact form submissions');
console.log('   • reviews table - Customer reviews');
console.log('   • add_ons table - Menu add-ons');
console.log('   • coupons table - Discount coupons');
console.log('');
console.log('   Plus: RLS policies, indexes, functions, and triggers');
console.log('');
console.log('💾 All migrations are ready in: create_all_missing_tables.sql');
console.log('📖 Full instructions in: DATABASE_SETUP_INSTRUCTIONS.md');
console.log('');
console.log('🎯 Current status: Waiting for Supabase access...');
console.log('');

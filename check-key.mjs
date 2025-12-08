#!/usr/bin/env node

/**
 * Service Role Key Checker
 *
 * Usage: node check-key.mjs <your-key-here>
 */

const key = process.argv[2];

if (!key) {
  console.log('❌ Usage: node check-key.mjs <your-key-here>');
  process.exit(1);
}

try {
  // Decode JWT (without verification)
  const parts = key.split('.');
  if (parts.length !== 3) {
    console.log('❌ Invalid JWT format (should have 3 parts separated by dots)');
    process.exit(1);
  }

  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

  console.log('🔍 Key Analysis:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Role:', payload.role || '❓ Unknown');
  console.log('Project:', payload.ref || '❓ Unknown');
  console.log('Issuer:', payload.iss || '❓ Unknown');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (payload.role === 'service_role') {
    console.log('✅ This is a SERVICE ROLE KEY!');
    console.log('');
    console.log('🎯 You can use this to run migrations!');
    console.log('');
    console.log('Add to .env:');
    console.log('SUPABASE_SERVICE_ROLE_KEY=' + key);
  } else if (payload.role === 'anon') {
    console.log('⚠️  This is an ANON KEY (not service role)');
    console.log('');
    console.log('You need the SERVICE ROLE key, not the anon key.');
  } else {
    console.log('❓ Unknown key type');
  }

} catch (err) {
  console.log('❌ Error parsing key:', err.message);
}

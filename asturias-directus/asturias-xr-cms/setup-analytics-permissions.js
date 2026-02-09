/**
 * Setup public permissions for analytics_events collection
 * 
 * This script grants the public role (unauthenticated users) permission to:
 * - CREATE analytics events (for tracking)
 * - READ analytics events (for the dashboard)
 * 
 * Run: node setup-analytics-permissions.js
 */

import dotenv from 'dotenv';
dotenv.config();

const DIRECTUS_URL = process.env.PUBLIC_URL || 'http://localhost:8055';
let TOKEN = '';

async function login() {
  console.log('🔐 Logging in to Directus...');
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    }),
  });
  const data = await res.json();
  TOKEN = data.data.access_token;
  console.log('✅ Logged in\n');
}

async function api(method, path, body) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${DIRECTUS_URL}${path}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function getExistingPermissions(collection) {
  const res = await api('GET', `/permissions?filter[collection][_eq]=${collection}&filter[role][_null]=true`);
  return res.data || [];
}

async function createPermission(collection, action, fields) {
  await api('POST', '/permissions', {
    role: null,
    collection,
    action,
    fields,
    permissions: {},
    validation: {},
  });
}

async function setupPermissions() {
  await login();

  // ── analytics_events: CREATE + READ ──
  console.log('📋 Setting up analytics_events permissions...');
  const existing = await getExistingPermissions('analytics_events');
  const existingActions = existing.map(p => p.action);
  console.log(`   Existing: [${existingActions.join(', ') || 'none'}]`);

  if (!existingActions.includes('create')) {
    await createPermission('analytics_events', 'create', [
      'event_type', 'resource_type', 'resource_id', 'session_id',
      'device_type', 'language', 'duration_seconds', 'completion_percentage',
      'municipality', 'extra_data', 'created_at',
    ]);
    console.log('   ✅ CREATE permission added');
  } else {
    console.log('   ✓ CREATE already exists');
  }

  if (!existingActions.includes('read')) {
    await createPermission('analytics_events', 'read', ['*']);
    console.log('   ✅ READ permission added');
  } else {
    console.log('   ✓ READ already exists');
  }

  // ── Content collections: READ ──
  const readCollections = [
    'museums', 'museums_translations',
    'tours_360', 'tours_360_translations',
    'ar_scenes', 'ar_scenes_translations',
    'routes', 'routes_translations', 'routes_categories',
    'pois', 'pois_translations', 'pois_categories',
    'vr_experiences', 'vr_experiences_translations',
    'categories', 'categories_translations',
    'languages',
    'directus_files',
  ];

  console.log('\n📋 Checking content collection permissions...');

  for (const collection of readCollections) {
    try {
      const perms = await getExistingPermissions(collection);
      const hasRead = perms.some(p => p.action === 'read');
      if (!hasRead) {
        await createPermission(collection, 'read', ['*']);
        console.log(`   ✅ ${collection} — READ added`);
      } else {
        console.log(`   ✓ ${collection} — READ exists`);
      }
    } catch (err) {
      console.log(`   ⚠️  ${collection} — ${err.message}`);
    }
  }

  console.log('\n🎉 Done! Public permissions configured:');
  console.log('   • analytics_events: CREATE + READ');
  console.log('   • All content collections: READ');
}

setupPermissions().catch(err => {
  console.error('❌ Error:', err.message || err);
  process.exit(1);
});

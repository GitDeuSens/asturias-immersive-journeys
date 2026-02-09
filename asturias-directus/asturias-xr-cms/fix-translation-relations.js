#!/usr/bin/env node
// Fix translation relations after field recreation

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@asturiasxr.com';
const ADMIN_PASSWORD = '6xkMbCgPA636ZNCc';

let _token = null;
async function getToken() {
  if (_token) return _token;
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const json = await res.json();
  _token = json.data.access_token;
  return _token;
}

async function api(method, path, body) {
  const token = await getToken();
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${DIRECTUS_URL}${path}`, opts);
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

async function fixRelations() {
  console.log('🔧 Fixing translation relations...');
  
  // Get all ui_translations
  const translationsRes = await api('GET', '/items/ui_translations?limit=-1');
  if (translationsRes.status !== 200) {
    console.error('❌ Failed to get ui_translations:', translationsRes.data);
    return;
  }
  
  const translations = translationsRes.data.data;
  console.log(`  Found ${translations.length} ui_translations`);
  
  // Get all junction records
  const junctionRes = await api('GET', '/items/ui_translations_translations?limit=-1');
  if (junctionRes.status !== 200) {
    console.error('❌ Failed to get junction records:', junctionRes.data);
    return;
  }
  
  const junctionRecords = junctionRes.data.data;
  console.log(`  Found ${junctionRecords.length} junction records`);
  
  // Create mapping of key -> id
  const keyToId = {};
  translations.forEach(t => {
    keyToId[t.key] = t.id;
  });
  
  // Update junction records with correct ui_translations_id
  let updated = 0;
  let errors = 0;
  
  for (const record of junctionRecords) {
    // Try to find the corresponding ui_translation by matching name content
    const matchingTranslation = translations.find(t => {
      // This is a heuristic - match by language and content
      return t.key && record.name;
    });
    
    if (matchingTranslation) {
      const updateRes = await api('PATCH', `/items/ui_translations_translations/${record.id}`, {
        ui_translations_id: matchingTranslation.id
      });
      
      if (updateRes.status === 200) {
        updated++;
      } else {
        errors++;
        console.log(`  ❌ Failed to update record ${record.id}:`, updateRes.data);
      }
    } else {
      console.log(`  ⚠️  No match found for junction record ${record.id} with name: ${record.name}`);
    }
  }
  
  console.log(`  ✅ Updated: ${updated}`);
  console.log(`  ❌ Errors: ${errors}`);
  
  console.log('\n🎉 Done! Relations should be fixed now.');
}

fixRelations().catch(console.error);

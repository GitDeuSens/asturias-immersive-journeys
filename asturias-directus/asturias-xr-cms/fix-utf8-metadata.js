/**
 * Fix UTF-8 encoding corruption in Directus field metadata
 * (notes, options, display_options in directus_fields)
 *
 * Uses the same CP850 reversal logic as fix-utf8.js
 *
 * Usage:
 *   node fix-utf8-metadata.js --dry-run
 *   node fix-utf8-metadata.js
 */

var DIRECTUS_URL = "https://back.asturias.digitalmetaverso.com";
var ADMIN_EMAIL = 'admin@asturiasxr.com';
var ADMIN_PASSWORD = '6xkMbCgPA636ZNCc';
var DRY_RUN = process.argv.includes('--dry-run');

// ============================================================
// CP850 decode table (same as fix-utf8.js)
// ============================================================
var CP850 = {};
CP850[0x80]=0x00C7; CP850[0x81]=0x00FC; CP850[0x82]=0x00E9; CP850[0x83]=0x00E2;
CP850[0x84]=0x00E4; CP850[0x85]=0x00E0; CP850[0x86]=0x00E5; CP850[0x87]=0x00E7;
CP850[0x88]=0x00EA; CP850[0x89]=0x00EB; CP850[0x8A]=0x00E8; CP850[0x8B]=0x00EF;
CP850[0x8C]=0x00EE; CP850[0x8D]=0x00EC; CP850[0x8E]=0x00C4; CP850[0x8F]=0x00C5;
CP850[0x90]=0x00C9; CP850[0x91]=0x00E6; CP850[0x92]=0x00C6; CP850[0x93]=0x00F4;
CP850[0x94]=0x00F6; CP850[0x95]=0x00F2; CP850[0x96]=0x00FB; CP850[0x97]=0x00F9;
CP850[0x98]=0x00FF; CP850[0x99]=0x00D6; CP850[0x9A]=0x00DC; CP850[0x9B]=0x00F8;
CP850[0x9C]=0x00A3; CP850[0x9D]=0x00D8; CP850[0x9E]=0x00D7; CP850[0x9F]=0x0192;
CP850[0xA0]=0x00E1; CP850[0xA1]=0x00ED; CP850[0xA2]=0x00F3; CP850[0xA3]=0x00FA;
CP850[0xA4]=0x00F1; CP850[0xA5]=0x00D1; CP850[0xA6]=0x00AA; CP850[0xA7]=0x00BA;
CP850[0xA8]=0x00BF; CP850[0xA9]=0x00AE; CP850[0xAA]=0x00AC; CP850[0xAB]=0x00BD;
CP850[0xAC]=0x00BC; CP850[0xAD]=0x00A1; CP850[0xAE]=0x00AB; CP850[0xAF]=0x00BB;
CP850[0xB0]=0x2591; CP850[0xB1]=0x2592; CP850[0xB2]=0x2593; CP850[0xB3]=0x2502;
CP850[0xB4]=0x2524; CP850[0xB5]=0x00C1; CP850[0xB6]=0x00C2; CP850[0xB7]=0x00C0;
CP850[0xB8]=0x00A9; CP850[0xB9]=0x2563; CP850[0xBA]=0x2551; CP850[0xBB]=0x2557;
CP850[0xBC]=0x255D; CP850[0xBD]=0x00A2; CP850[0xBE]=0x00A5; CP850[0xBF]=0x2510;

var REVERSE = {};
for (var byte in CP850) { REVERSE[CP850[byte]] = parseInt(byte); }
for (var b = 0x80; b <= 0xBF; b++) { if (!REVERSE[b]) REVERSE[b] = b; }

var LEAD_MAP = {};
LEAD_MAP[0x251C] = 0xC3;
LEAD_MAP[0x252C] = 0xC2;
LEAD_MAP[0x253C] = 0xC5;
LEAD_MAP[0x2500] = 0xC4;

var REPLACEMENTS = {};
for (var leadCPStr in LEAD_MAP) {
  var leadCP = parseInt(leadCPStr);
  var leadByte = LEAD_MAP[leadCP];
  var leadChar = String.fromCharCode(leadCP);
  for (var trailCPStr in REVERSE) {
    var trailCP = parseInt(trailCPStr);
    var trailByte = REVERSE[trailCP];
    if (trailByte < 0x80 || trailByte > 0xBF) continue;
    var corrupted = leadChar + String.fromCharCode(trailCP);
    var correct = Buffer.from([leadByte, trailByte]).toString('utf8');
    if (correct && correct.length === 1 && corrupted !== correct) REPLACEMENTS[corrupted] = correct;
  }
  for (var tb = 0x80; tb <= 0xBF; tb++) {
    var corrupted2 = leadChar + String.fromCharCode(tb);
    var correct2 = Buffer.from([leadByte, tb]).toString('utf8');
    if (correct2 && correct2.length === 1 && !REPLACEMENTS[corrupted2]) REPLACEMENTS[corrupted2] = correct2;
  }
}

console.log('Built ' + Object.keys(REPLACEMENTS).length + ' replacement patterns\n');

function fixText(text) {
  if (!text || typeof text !== 'string') return { fixed: text, changed: false };
  var result = text;
  var keys = Object.keys(REPLACEMENTS).sort(function(a, b) { return b.length - a.length; });
  for (var i = 0; i < keys.length; i++) {
    while (result.includes(keys[i])) { result = result.split(keys[i]).join(REPLACEMENTS[keys[i]]); }
  }
  return { fixed: result, changed: result !== text };
}

// Deep-fix: recursively fix all string values in an object/array
function deepFix(obj) {
  if (typeof obj === 'string') {
    var r = fixText(obj);
    return { value: r.fixed, changed: r.changed };
  }
  if (Array.isArray(obj)) {
    var changed = false;
    var arr = obj.map(function(item) {
      var r = deepFix(item);
      if (r.changed) changed = true;
      return r.value;
    });
    return { value: arr, changed: changed };
  }
  if (obj && typeof obj === 'object') {
    var changed2 = false;
    var out = {};
    for (var k in obj) {
      var r = deepFix(obj[k]);
      out[k] = r.value;
      if (r.changed) changed2 = true;
    }
    return { value: out, changed: changed2 };
  }
  return { value: obj, changed: false };
}

async function getToken() {
  var res = await fetch(DIRECTUS_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error('Auth failed: ' + res.status);
  var json = await res.json();
  return json.data.access_token;
}

async function main() {
  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== FIXING METADATA ===');
  console.log('Target: ' + DIRECTUS_URL + '\n');

  var token = await getToken();
  console.log('Authenticated\n');

  // 1. Fix directus_fields metadata
  console.log('--- directus_fields ---');
  var res = await fetch(DIRECTUS_URL + '/fields', { headers: { Authorization: 'Bearer ' + token } });
  var fieldsData = await res.json();
  var fields = fieldsData.data || [];
  var fieldsFixed = 0;

  for (var i = 0; i < fields.length; i++) {
    var f = fields[i];
    var meta = f.meta;
    if (!meta) continue;

    var patch = {};
    var hasChanges = false;

    // Fix note
    if (meta.note) {
      var noteResult = fixText(meta.note);
      if (noteResult.changed) { patch.note = noteResult.fixed; hasChanges = true; }
    }

    // Fix options (object with nested strings)
    if (meta.options) {
      var optResult = deepFix(meta.options);
      if (optResult.changed) { patch.options = optResult.value; hasChanges = true; }
    }

    // Fix display_options
    if (meta.display_options) {
      var dispResult = deepFix(meta.display_options);
      if (dispResult.changed) { patch.display_options = dispResult.value; hasChanges = true; }
    }

    // Fix translations if present
    if (meta.translations) {
      var transResult = deepFix(meta.translations);
      if (transResult.changed) { patch.translations = transResult.value; hasChanges = true; }
    }

    if (hasChanges) {
      var label = f.collection + '.' + f.field;
      if (DRY_RUN) {
        for (var key in patch) {
          var before = JSON.stringify(meta[key]).slice(0, 100);
          var after = JSON.stringify(patch[key]).slice(0, 100);
          console.log('  ' + label + ' [' + key + ']');
          console.log('    BEFORE: ' + before);
          console.log('    AFTER:  ' + after);
        }
      } else {
        try {
          var patchRes = await fetch(DIRECTUS_URL + '/fields/' + f.collection + '/' + f.field, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({ meta: patch }),
          });
          if (!patchRes.ok) {
            var errText = await patchRes.text();
            console.log('  ERROR ' + label + ': ' + patchRes.status + ' ' + errText.slice(0, 150));
          } else {
            fieldsFixed++;
            console.log('  Fixed: ' + label);
          }
        } catch (e) {
          console.log('  ERROR ' + label + ': ' + e.message);
        }
      }
    }
  }
  console.log(DRY_RUN ? 'Fields to fix: ' + fieldsFixed : 'Fields fixed: ' + fieldsFixed);

  // 2. Fix directus_collections metadata (note, translations)
  console.log('\n--- directus_collections ---');
  var colRes = await fetch(DIRECTUS_URL + '/collections', { headers: { Authorization: 'Bearer ' + token } });
  var colData = await colRes.json();
  var collections = colData.data || [];
  var colsFixed = 0;

  for (var c = 0; c < collections.length; c++) {
    var col = collections[c];
    var cmeta = col.meta;
    if (!cmeta) continue;

    var cpatch = {};
    var chasChanges = false;

    if (cmeta.note) {
      var cnr = fixText(cmeta.note);
      if (cnr.changed) { cpatch.note = cnr.fixed; chasChanges = true; }
    }
    if (cmeta.translations) {
      var ctr = deepFix(cmeta.translations);
      if (ctr.changed) { cpatch.translations = ctr.value; chasChanges = true; }
    }

    if (chasChanges) {
      if (DRY_RUN) {
        for (var ck in cpatch) {
          console.log('  ' + col.collection + ' [' + ck + ']: ' + JSON.stringify(cpatch[ck]).slice(0, 100));
        }
      } else {
        try {
          var cpRes = await fetch(DIRECTUS_URL + '/collections/' + col.collection, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({ meta: cpatch }),
          });
          if (cpRes.ok) { colsFixed++; console.log('  Fixed: ' + col.collection); }
          else { console.log('  ERROR ' + col.collection + ': ' + cpRes.status); }
        } catch (e) {
          console.log('  ERROR ' + col.collection + ': ' + e.message);
        }
      }
    }
  }
  console.log(DRY_RUN ? 'Collections to fix: ' + colsFixed : 'Collections fixed: ' + colsFixed);

  // 3. Fix directus_settings
  console.log('\n--- directus_settings ---');
  var setRes = await fetch(DIRECTUS_URL + '/settings', { headers: { Authorization: 'Bearer ' + token } });
  var setData = await setRes.json();
  var settings = setData.data;
  if (settings) {
    var settingsFields = ['project_name', 'project_descriptor', 'default_language', 'custom_css'];
    var spatch = {};
    var schanged = false;
    for (var sf = 0; sf < settingsFields.length; sf++) {
      var sk = settingsFields[sf];
      if (settings[sk]) {
        var sr = fixText(settings[sk]);
        if (sr.changed) { spatch[sk] = sr.fixed; schanged = true; }
      }
    }
    // Also deep-fix translation_strings
    if (settings.translation_strings) {
      var tsr = deepFix(settings.translation_strings);
      if (tsr.changed) { spatch.translation_strings = tsr.value; schanged = true; }
    }
    if (schanged) {
      if (DRY_RUN) {
        console.log('  Settings to fix: ' + JSON.stringify(Object.keys(spatch)));
      } else {
        var spRes = await fetch(DIRECTUS_URL + '/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify(spatch),
        });
        console.log(spRes.ok ? '  Settings fixed' : '  Settings ERROR: ' + spRes.status);
      }
    } else {
      console.log('  OK (clean)');
    }
  }

  // 4. Clear cache
  if (!DRY_RUN) {
    console.log('\nClearing cache...');
    await fetch(DIRECTUS_URL + '/utils/cache/clear', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
    });
    console.log('Cache cleared');
  }

  console.log('\n' + '='.repeat(60));
  console.log('Done!');
  console.log('='.repeat(60));
}

main().catch(function(err) { console.error('Fatal: ' + err.message); process.exit(1); });

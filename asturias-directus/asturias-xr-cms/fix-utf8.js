/**
 * Fix UTF-8 encoding corruption in Directus database
 *
 * Root cause: SQL dump was piped through PowerShell Get-Content which decoded
 * UTF-8 bytes through CP850 (DOS Western European codepage), turning accented
 * characters into box-drawing and other graphic characters.
 *
 * CP850 mapping for UTF-8 lead bytes:
 *   0xC3 -> U+251C (├)   — most accented Latin chars
 *   0xC2 -> U+252C (┬)   — symbols like degree, inverted punctuation
 *   0xC5 -> U+253C (┼)   — some extended Latin chars
 *
 * Usage:
 *   node fix-utf8.js --dry-run   (preview changes)
 *   node fix-utf8.js             (apply fixes)
 */

var DIRECTUS_URL = "https://back.asturias.digitalmetaverso.com";
var ADMIN_EMAIL = 'admin@asturiasxr.com';
var ADMIN_PASSWORD = '6xkMbCgPA636ZNCc';
var DRY_RUN = process.argv.includes('--dry-run');

// ============================================================
// CP850 byte-to-unicode mapping for bytes 0x80-0xBF
// These are the bytes that appear as UTF-8 continuation bytes.
// When PowerShell reads them as CP850, they become these codepoints.
// We need the reverse: given a CP850 codepoint, recover the original byte.
// ============================================================

var CP850 = {};
// Byte -> CP850 Unicode codepoint
CP850[0x80] = 0x00C7; // Ç
CP850[0x81] = 0x00FC; // ü
CP850[0x82] = 0x00E9; // é
CP850[0x83] = 0x00E2; // â
CP850[0x84] = 0x00E4; // ä
CP850[0x85] = 0x00E0; // à
CP850[0x86] = 0x00E5; // å
CP850[0x87] = 0x00E7; // ç
CP850[0x88] = 0x00EA; // ê
CP850[0x89] = 0x00EB; // ë
CP850[0x8A] = 0x00E8; // è
CP850[0x8B] = 0x00EF; // ï
CP850[0x8C] = 0x00EE; // î
CP850[0x8D] = 0x00EC; // ì
CP850[0x8E] = 0x00C4; // Ä
CP850[0x8F] = 0x00C5; // Å
CP850[0x90] = 0x00C9; // É
CP850[0x91] = 0x00E6; // æ
CP850[0x92] = 0x00C6; // Æ
CP850[0x93] = 0x00F4; // ô
CP850[0x94] = 0x00F6; // ö
CP850[0x95] = 0x00F2; // ò
CP850[0x96] = 0x00FB; // û
CP850[0x97] = 0x00F9; // ù
CP850[0x98] = 0x00FF; // ÿ
CP850[0x99] = 0x00D6; // Ö
CP850[0x9A] = 0x00DC; // Ü
CP850[0x9B] = 0x00F8; // ø  (CP850 differs from CP437 here)
CP850[0x9C] = 0x00A3; // £
CP850[0x9D] = 0x00D8; // Ø  (CP850 differs from CP437 here)
CP850[0x9E] = 0x00D7; // ×  (CP850 differs from CP437 here)
CP850[0x9F] = 0x0192; // ƒ
CP850[0xA0] = 0x00E1; // á
CP850[0xA1] = 0x00ED; // í
CP850[0xA2] = 0x00F3; // ó
CP850[0xA3] = 0x00FA; // ú
CP850[0xA4] = 0x00F1; // ñ
CP850[0xA5] = 0x00D1; // Ñ
CP850[0xA6] = 0x00AA; // ª
CP850[0xA7] = 0x00BA; // º
CP850[0xA8] = 0x00BF; // ¿
CP850[0xA9] = 0x00AE; // ®  <-- THIS is why é (C3 A9) becomes ├®
CP850[0xAA] = 0x00AC; // ¬
CP850[0xAB] = 0x00BD; // ½
CP850[0xAC] = 0x00BC; // ¼
CP850[0xAD] = 0x00A1; // ¡
CP850[0xAE] = 0x00AB; // «
CP850[0xAF] = 0x00BB; // »
CP850[0xB0] = 0x2591; // ░
CP850[0xB1] = 0x2592; // ▒
CP850[0xB2] = 0x2593; // ▓
CP850[0xB3] = 0x2502; // │
CP850[0xB4] = 0x2524; // ┤
CP850[0xB5] = 0x00C1; // Á  (CP850 differs from CP437)
CP850[0xB6] = 0x00C2; // Â  (CP850 differs from CP437)
CP850[0xB7] = 0x00C0; // À  (CP850 differs from CP437)
CP850[0xB8] = 0x00A9; // ©  (CP850 differs from CP437)
CP850[0xB9] = 0x2563; // ╣
CP850[0xBA] = 0x2551; // ║
CP850[0xBB] = 0x2557; // ╗
CP850[0xBC] = 0x255D; // ╝
CP850[0xBD] = 0x00A2; // ¢  (CP850 differs from CP437)
CP850[0xBE] = 0x00A5; // ¥  (CP850 differs from CP437)
CP850[0xBF] = 0x2510; // ┐

// Build reverse: CP850_unicode_codepoint -> original_byte_value
var REVERSE = {};
for (var byte in CP850) {
  REVERSE[CP850[byte]] = parseInt(byte);
}
// Also add identity for bytes that might pass through unchanged
for (var b = 0x80; b <= 0xBF; b++) {
  if (!REVERSE[b]) REVERSE[b] = b;
}

// Lead byte CP850 mappings
var LEAD_MAP = {};
LEAD_MAP[0x251C] = 0xC3; // ├ -> 0xC3
LEAD_MAP[0x252C] = 0xC2; // ┬ -> 0xC2
LEAD_MAP[0x253C] = 0xC5; // ┼ -> 0xC5
LEAD_MAP[0x2500] = 0xC4; // ─ -> 0xC4

// Build full replacement table
var REPLACEMENTS = {};

for (var leadCPStr in LEAD_MAP) {
  var leadCP = parseInt(leadCPStr);
  var leadByte = LEAD_MAP[leadCP];
  var leadChar = String.fromCharCode(leadCP);

  // Try every possible trailing codepoint from the CP850 reverse map
  for (var trailCPStr in REVERSE) {
    var trailCP = parseInt(trailCPStr);
    var trailByte = REVERSE[trailCP];
    if (trailByte < 0x80 || trailByte > 0xBF) continue;

    var corrupted = leadChar + String.fromCharCode(trailCP);
    var correct = Buffer.from([leadByte, trailByte]).toString('utf8');

    if (correct && correct.length === 1 && corrupted !== correct) {
      REPLACEMENTS[corrupted] = correct;
    }
  }

  // Also try trailing bytes that kept their raw value (0x80-0xBF as codepoints)
  for (var tb = 0x80; tb <= 0xBF; tb++) {
    var corrupted2 = leadChar + String.fromCharCode(tb);
    var correct2 = Buffer.from([leadByte, tb]).toString('utf8');
    if (correct2 && correct2.length === 1 && !REPLACEMENTS[corrupted2]) {
      REPLACEMENTS[corrupted2] = correct2;
    }
  }
}

console.log('Built ' + Object.keys(REPLACEMENTS).length + ' replacement patterns');

// Quick sanity check for the key patterns we saw in the data
var checks = [
  { corrupted: '\u251c\u00ae', expected: '\u00e9', label: 'e-acute' },      // ├® -> é
  { corrupted: '\u251c\u2502', expected: '\u00f3', label: 'o-acute' },      // ├│ -> ó
  { corrupted: '\u251c\u00a1', expected: '\u00ed', label: 'i-acute' },      // ├¡ -> í  (0xA1=í in CP850 -> byte 0xAD)
  { corrupted: '\u251c\u2592', expected: '\u00f1', label: 'n-tilde' },      // ├▒ -> ñ
  { corrupted: '\u251c\u00ed', expected: '\u00e1', label: 'a-acute' },      // ├í -> á  (0xED=í -> byte 0xA0? no...)
  { corrupted: '\u251c\u2551', expected: '\u00fa', label: 'u-acute' },      // ├║ -> ú
  { corrupted: '\u251c\u00ac', expected: '\u00ec', label: 'i-grave' },      // ├¬ -> ì
  { corrupted: '\u251c\u00eb', expected: '\u00cb', label: 'E-diaeresis' },  // ├ë -> Ë
  { corrupted: '\u251c\u00bf', expected: '\u00ff', label: 'y-diaeresis' },  // ├¿ -> ÿ
  { corrupted: '\u251c\u00e1', expected: '\u00e0', label: 'a-grave-2' },    // ├á -> à  (0xE1=á in CP850 -> byte 0xA0)
  { corrupted: '\u252c\u2591', expected: '\u00b0', label: 'degree' },       // ┬░ -> °
  { corrupted: '\u251c\u00c7', expected: '\u00c0', label: 'A-grave' },      // ├Ç -> À  (0xC7=Ç in CP850 -> byte 0x80? no, 0xB7)
  { corrupted: '\u251c\u2524', expected: '\u00f4', label: 'o-circumflex' }, // ├┤ -> ô
  { corrupted: '\u251c\u00ba', expected: '\u00f9', label: 'u-grave' },      // ├º -> ù  (0xBA=║? no, 0xA7=º -> byte 0xA7? )
  { corrupted: '\u251c\u00ab', expected: '\u00eb', label: 'e-diaeresis' },  // ├« -> ë
  { corrupted: '\u251c\u00dc', expected: '\u009c', label: 'check-dc' },     // ├Ü -> ?
  { corrupted: '\u251c\u2563', expected: '\u00f9', label: 'u-grave-2' },    // ├╣ -> ù
  { corrupted: '\u253c\u00f4', expected: null, label: 'check-c5' },         // ┼ô -> ?
];

console.log('\nSanity checks:');
for (var i = 0; i < checks.length; i++) {
  var c = checks[i];
  var actual = REPLACEMENTS[c.corrupted];
  var status = actual ? ('-> ' + actual + ' (U+' + actual.charCodeAt(0).toString(16).toUpperCase() + ')') : 'NOT FOUND';
  console.log('  ' + c.label.padEnd(16) + ' ' + status);
}
console.log();

// ============================================================
// Tables to scan
// ============================================================

var TABLES = [
  { collection: 'pois_translations', fields: ['title', 'short_description', 'description', 'how_to_get', 'accessibility', 'parking', 'opening_hours', 'prices'] },
  { collection: 'routes_translations', fields: ['title', 'short_description', 'description', 'duration', 'theme'] },
  { collection: 'ar_scenes_translations', fields: ['title', 'description', 'instructions'] },
  { collection: 'museums_translations', fields: ['name', 'short_description', 'description', 'opening_hours', 'prices', 'accessibility'] },
  { collection: 'categories_translations', fields: ['name', 'description'] },
  { collection: 'tours_360_translations', fields: ['title', 'description'] },
  { collection: 'vr_experiences_translations', fields: ['title', 'short_description', 'description'] },
  { collection: 'ui_translations_translations', fields: ['name'] },
  { collection: 'ar_scenes', fields: ['popup_text_es', 'popup_text_en', 'popup_text_fr', 'seo_title', 'seo_description'] },
  { collection: 'museums', fields: ['address', 'municipality', 'seo_title', 'seo_description'] },
  { collection: 'pois', fields: ['address', 'seo_title', 'seo_description'] },
  { collection: 'routes', fields: ['seo_title', 'seo_description'] },
];

// ============================================================
// Helpers
// ============================================================

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

async function fetchAll(token, collection, fields) {
  var fieldsParam = ['id'].concat(fields).join(',');
  var res = await fetch(DIRECTUS_URL + '/items/' + collection + '?fields=' + fieldsParam + '&limit=-1', {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!res.ok) return [];
  var json = await res.json();
  return json.data || [];
}

async function patchItem(token, collection, id, patch) {
  var res = await fetch(DIRECTUS_URL + '/items/' + collection + '/' + id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    var text = await res.text();
    throw new Error('PATCH ' + collection + '/' + id + ': ' + res.status + ' ' + text.slice(0, 200));
  }
}

function fixText(text) {
  if (!text || typeof text !== 'string') return { fixed: text, changed: false };
  var result = text;
  var keys = Object.keys(REPLACEMENTS).sort(function(a, b) { return b.length - a.length; });
  for (var i = 0; i < keys.length; i++) {
    while (result.includes(keys[i])) {
      result = result.split(keys[i]).join(REPLACEMENTS[keys[i]]);
    }
  }
  return { fixed: result, changed: result !== text };
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log(DRY_RUN ? '=== DRY RUN (no changes) ===' : '=== FIXING ENCODING ===');
  console.log('Target: ' + DIRECTUS_URL + '\n');

  var token = await getToken();
  console.log('Authenticated\n');

  var totalIssues = 0;
  var totalPatched = 0;

  for (var t = 0; t < TABLES.length; t++) {
    var table = TABLES[t];
    process.stdout.write('Checking ' + table.collection + '...');

    var rows;
    try { rows = await fetchAll(token, table.collection, table.fields); }
    catch (e) { console.log(' SKIP (' + e.message + ')'); continue; }

    var tableIssues = 0;
    var tablePatched = 0;

    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      var patch = {};
      var hasChanges = false;

      for (var f = 0; f < table.fields.length; f++) {
        var field = table.fields[f];
        var result = fixText(row[field]);
        if (result.changed) {
          patch[field] = result.fixed;
          hasChanges = true;
          tableIssues++;
        }
      }

      if (hasChanges) {
        if (DRY_RUN) {
          var cfs = Object.keys(patch);
          for (var c = 0; c < cfs.length; c++) {
            var orig = (row[cfs[c]] || '').slice(0, 100);
            var fixed = patch[cfs[c]].slice(0, 100);
            console.log('\n    [' + row.id + '] ' + cfs[c]);
            console.log('      BEFORE: ' + orig);
            console.log('      AFTER:  ' + fixed);
          }
        } else {
          try {
            await patchItem(token, table.collection, row.id, patch);
            tablePatched++;
          } catch (e) {
            console.log('\n    ERROR: ' + e.message);
          }
        }
      }
    }

    if (tableIssues > 0) {
      var suffix = DRY_RUN ? '' : (', patched ' + tablePatched + ' rows');
      console.log(' ' + tableIssues + ' fields' + suffix);
    } else {
      console.log(' OK (' + rows.length + ' rows)');
    }
    totalIssues += tableIssues;
    totalPatched += tablePatched;
  }

  console.log('\n' + '='.repeat(60));
  if (totalIssues === 0) {
    console.log('No encoding issues found.');
  } else if (DRY_RUN) {
    console.log('Found ' + totalIssues + ' corrupted fields.');
    console.log('\nRun without --dry-run to apply fixes:');
    console.log('  node fix-utf8.js');
  } else {
    console.log('Done! Patched ' + totalPatched + ' rows (' + totalIssues + ' fields).');
  }
  console.log('='.repeat(60));
}

main().catch(function(err) { console.error('Fatal: ' + err.message); process.exit(1); });

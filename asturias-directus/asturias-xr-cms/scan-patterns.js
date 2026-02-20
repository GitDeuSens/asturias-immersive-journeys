/**
 * Scan the entire DB for all unique corruption patterns involving U+251C
 * and other box-drawing / CP437 characters, to build a complete replacement map.
 */

var DIRECTUS_URL = "https://back.asturias.digitalmetaverso.com";
var ADMIN_EMAIL = 'admin@asturiasxr.com';
var ADMIN_PASSWORD = '6xkMbCgPA636ZNCc';

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

// Characters that should NOT appear in normal Spanish/French/English text
var SUSPECT_RANGES = function(code) {
  return (code >= 0x2500 && code <= 0x257F) || // box drawing
         (code >= 0x2580 && code <= 0x259F) || // block elements
         (code === 0x251c) || (code === 0x2502) || (code === 0x2592) ||
         (code === 0x2510) || (code === 0x2514) || (code === 0x2518) ||
         (code === 0x253c) || (code === 0x2524) || (code === 0x252c) ||
         (code === 0x2534) || (code === 0x2551) || (code === 0x2550) ||
         (code === 0x00c2) || (code === 0x00c3); // common double-encode lead bytes
};

async function getToken() {
  var res = await fetch(DIRECTUS_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
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

async function main() {
  var token = await getToken();
  // Collect all unique 2-char and 3-char sequences starting with suspect chars
  var patterns = {};

  for (var t = 0; t < TABLES.length; t++) {
    var table = TABLES[t];
    var rows;
    try { rows = await fetchAll(token, table.collection, table.fields); } catch(e) { continue; }

    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      for (var f = 0; f < table.fields.length; f++) {
        var val = row[table.fields[f]];
        if (!val || typeof val !== 'string') continue;

        for (var i = 0; i < val.length - 1; i++) {
          var code = val.charCodeAt(i);
          if (SUSPECT_RANGES(code)) {
            var c1 = val.charCodeAt(i + 1);
            var key2 = code.toString(16) + '+' + c1.toString(16);
            var ctx = val.substring(Math.max(0, i - 5), Math.min(val.length, i + 8));
            if (!patterns[key2]) {
              patterns[key2] = { count: 0, example: ctx };
            }
            patterns[key2].count++;
          }
        }
      }
    }
  }

  // Sort by count descending
  var keys = Object.keys(patterns).sort(function(a, b) { return patterns[b].count - patterns[a].count; });
  console.log('Found ' + keys.length + ' unique suspect patterns:\n');
  for (var k = 0; k < keys.length; k++) {
    var p = patterns[keys[k]];
    console.log('  ' + keys[k].padEnd(15) + ' x' + String(p.count).padStart(4) + '  example: ' + p.example);
  }
}

main().catch(function(err) { console.error('Fatal:', err.message); process.exit(1); });

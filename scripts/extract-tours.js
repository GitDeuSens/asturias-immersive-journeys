// Script to download ZIP archives from Directus and extract them to public/
// Handles both 360 tours (public/tours-builds/) and AR scenes (public/ar-builds/)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL || 'http://localhost:8055';

async function extractCollection(collection, buildDir, label) {
  const outputBase = path.join(PROJECT_ROOT, 'public', buildDir);
  console.log(`\n🔍 Fetching ${label} with build_zip from Directus...`);

  const res = await fetch(`${DIRECTUS_URL}/items/${collection}?fields=id,slug,build_path,build_zip&filter[build_zip][_nnull]=true`);
  const { data: items } = await res.json();

  if (!items || items.length === 0) {
    console.log(`   No ${label} with ZIP archives found.`);
    return;
  }

  console.log(`   Found ${items.length} ${label} with ZIP archives.\n`);

  for (const item of items) {
    const slug = item.slug;
    const zipId = item.build_zip;
    const outputPath = path.join(outputBase, slug);

    console.log(`📦 ${slug} (ZIP: ${zipId})`);

    // Skip if already extracted (check for index.html or index.htm)
    if (fs.existsSync(path.join(outputPath, 'index.html')) || fs.existsSync(path.join(outputPath, 'index.htm'))) {
      console.log(`   ⚠ Already extracted, skipping. Delete ${buildDir}/${slug}/ to re-extract.`);
      continue;
    }

    // Download ZIP
    console.log(`   ⬇ Downloading ZIP...`);
    const zipRes = await fetch(`${DIRECTUS_URL}/assets/${zipId}`);
    if (!zipRes.ok) {
      console.error(`   ✗ Failed to download: ${zipRes.status}`);
      continue;
    }
    const zipBuffer = await zipRes.arrayBuffer();
    console.log(`   ✓ Downloaded ${(zipBuffer.byteLength / 1024 / 1024).toFixed(1)} MB`);

    // Unpack
    console.log(`   📂 Extracting...`);
    const zip = await JSZip.loadAsync(zipBuffer);

    // Find root prefix (tools often wrap in a folder)
    const allPaths = Object.keys(zip.files).filter(p => !p.startsWith('__MACOSX'));
    let rootPrefix = '';
    const indexFile = allPaths.find(p => (p.endsWith('index.html') || p.endsWith('index.htm')) && !p.startsWith('__MACOSX'));
    if (indexFile) {
      const lastSlash = indexFile.lastIndexOf('/');
      rootPrefix = lastSlash > 0 ? indexFile.substring(0, lastSlash + 1) : '';
    }

    let fileCount = 0;
    for (const [fullPath, entry] of Object.entries(zip.files)) {
      if (entry.dir || fullPath.startsWith('__MACOSX')) continue;

      let relativePath = fullPath;
      if (rootPrefix && fullPath.startsWith(rootPrefix)) {
        relativePath = fullPath.substring(rootPrefix.length);
      }
      if (!relativePath) continue;

      const filePath = path.join(outputPath, relativePath);
      const dir = path.dirname(filePath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const content = await entry.async('nodebuffer');
      fs.writeFileSync(filePath, content);
      fileCount++;
    }

    console.log(`   ✓ Extracted ${fileCount} files to public/${buildDir}/${slug}/`);

    // Update build_path in Directus if not set
    if (!item.build_path) {
      const buildPath = `/${buildDir}/${slug}/`;
      try {
        await fetch(`${DIRECTUS_URL}/items/${collection}/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ build_path: buildPath }),
        });
        console.log(`   ✓ Updated build_path → ${buildPath}`);
      } catch (e) {
        console.log(`   ⚠ Could not update build_path (set manually to ${buildPath})`);
      }
    }
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  EXTRACT DIST ARCHIVES FROM DIRECTUS             ║');
  console.log('╚══════════════════════════════════════════════════╝');

  await extractCollection('tours_360', 'tours-builds', '360 tours');
  await extractCollection('ar_scenes', 'ar-builds', 'AR scenes');

  console.log('\n✅ Done! Builds are available at:');
  console.log('   /tours-builds/{slug}/  — 360 virtual tours');
  console.log('   /ar-builds/{slug}/     — AR experiences');
  console.log('\n   Restart Vite dev server if needed.');
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });

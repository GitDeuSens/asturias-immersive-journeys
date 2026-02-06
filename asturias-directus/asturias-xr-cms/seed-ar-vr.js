import { createDirectus, rest, authentication, createItem, readItems } from '@directus/sdk';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const directus = createDirectus(process.env.PUBLIC_URL || 'http://localhost:8055')
  .with(authentication())
  .with(rest());

function addUUIDs(obj) {
  if (Array.isArray(obj)) obj.forEach(item => addUUIDs(item));
  else if (obj && typeof obj === 'object') {
    if ('languages_code' in obj && !obj.id) obj.id = randomUUID();
    for (const val of Object.values(obj)) {
      if (Array.isArray(val)) addUUIDs(val);
    }
  }
}

function msg(e) { return String(e?.errors?.[0]?.message || e?.message || JSON.stringify(e) || e); }

async function safeCreate(collection, data, label) {
  if (!data.id) data.id = randomUUID();
  addUUIDs(data);
  try {
    const result = await directus.request(createItem(collection, data));
    console.log(`   ✓ ${label}`);
    return result;
  } catch (e) {
    const m = msg(e);
    if (m.includes('unique') || m.includes('already') || m.includes('duplicate')) {
      console.log(`   ⚠ ${label} (already exists)`);
      return null;
    }
    console.error(`   ✗ ${label}: ${m}`);
    return null;
  }
}

// ============================================
// AR SCENES
// ============================================

const AR_SCENES = [
  {
    slug: 'covadonga-ar',
    ar_type: 'slam',
    difficulty: 'easy',
    duration_minutes: 10,
    requires_outdoors: true,
    featured: true,
    status: 'published',
    location_lat: 43.2704,
    location_lng: -4.9856,
    translations: [
      { languages_code: 'es', title: 'Lagos de Covadonga AR', description: 'Experiencia de realidad aumentada en los Lagos de Covadonga. Descubre la geología glaciar y la fauna del Parque Nacional.', instructions: 'Apunta tu cámara al paisaje para ver información superpuesta sobre la geología y fauna.' },
      { languages_code: 'en', title: 'Lakes of Covadonga AR', description: 'Augmented reality experience at the Lakes of Covadonga. Discover the glacial geology and wildlife of the National Park.' },
      { languages_code: 'fr', title: 'Lacs de Covadonga AR', description: 'Expérience de réalité augmentée aux Lacs de Covadonga. Découvrez la géologie glaciaire et la faune du Parc National.' },
    ],
  },
  {
    slug: 'picos-ar',
    ar_type: 'geo',
    difficulty: 'moderate',
    duration_minutes: 15,
    requires_outdoors: true,
    featured: true,
    status: 'published',
    location_lat: 43.2194,
    location_lng: -4.8119,
    location_radius_meters: 100,
    translations: [
      { languages_code: 'es', title: 'Mirador del Naranjo AR', description: 'Identifica las cumbres de los Picos de Europa con realidad aumentada desde el mirador.' },
      { languages_code: 'en', title: 'Naranjo Viewpoint AR', description: 'Identify the peaks of the Picos de Europa with augmented reality from the viewpoint.' },
      { languages_code: 'fr', title: 'Belvédère du Naranjo AR', description: 'Identifiez les sommets des Picos de Europa en réalité augmentée depuis le belvédère.' },
    ],
  },
  {
    slug: 'muja-ar',
    ar_type: 'slam',
    difficulty: 'easy',
    duration_minutes: 12,
    requires_outdoors: false,
    featured: true,
    status: 'published',
    location_lat: 43.4897,
    location_lng: -5.2706,
    translations: [
      { languages_code: 'es', title: 'Dinosaurios del MUJA AR', description: 'Haz aparecer dinosaurios jurásicos a tamaño real en el Museo del Jurásico de Asturias.' },
      { languages_code: 'en', title: 'MUJA Dinosaurs AR', description: 'Make life-size Jurassic dinosaurs appear at the Jurassic Museum of Asturias.' },
      { languages_code: 'fr', title: 'Dinosaures du MUJA AR', description: 'Faites apparaître des dinosaures jurassiques grandeur nature au Musée du Jurassique des Asturies.' },
    ],
  },
  {
    slug: 'playa-griega-ar',
    ar_type: 'geo',
    difficulty: 'easy',
    duration_minutes: 8,
    requires_outdoors: true,
    featured: false,
    status: 'published',
    location_lat: 43.4989,
    location_lng: -5.2644,
    location_radius_meters: 50,
    translations: [
      { languages_code: 'es', title: 'Huellas de Dinosaurio AR', description: 'Visualiza las huellas de dinosaurio de la Playa de La Griega con información aumentada sobre las especies.' },
      { languages_code: 'en', title: 'Dinosaur Footprints AR', description: 'Visualize the dinosaur footprints of La Griega Beach with augmented information about the species.' },
      { languages_code: 'fr', title: 'Empreintes de Dinosaures AR', description: 'Visualisez les empreintes de dinosaures de la Plage de La Griega avec des informations augmentées sur les espèces.' },
    ],
  },
  {
    slug: 'preromanico-ar',
    ar_type: 'image-tracking',
    difficulty: 'easy',
    duration_minutes: 10,
    requires_outdoors: false,
    featured: true,
    status: 'published',
    location_lat: 43.3833,
    location_lng: -5.8667,
    marker_size_cm: 21,
    translations: [
      { languages_code: 'es', title: 'Prerrománico Asturiano AR', description: 'Escanea el marcador para ver una reconstrucción 3D del interior de Santa María del Naranco.' },
      { languages_code: 'en', title: 'Asturian Pre-Romanesque AR', description: 'Scan the marker to see a 3D reconstruction of the interior of Santa María del Naranco.' },
      { languages_code: 'fr', title: 'Préroman Asturien AR', description: 'Scannez le marqueur pour voir une reconstruction 3D de l\'intérieur de Santa María del Naranco.' },
    ],
  },
  {
    slug: 'ecomuseo-samuno-ar',
    ar_type: 'slam',
    difficulty: 'easy',
    duration_minutes: 10,
    requires_outdoors: false,
    featured: false,
    status: 'published',
    location_lat: 43.295,
    location_lng: -5.678,
    translations: [
      { languages_code: 'es', title: 'Mina de Samuño AR', description: 'Explora las galerías mineras del Valle de Samuño en realidad aumentada.' },
      { languages_code: 'en', title: 'Samuño Mine AR', description: 'Explore the mining galleries of the Samuño Valley in augmented reality.' },
      { languages_code: 'fr', title: 'Mine de Samuño AR', description: 'Explorez les galeries minières de la Vallée de Samuño en réalité augmentée.' },
    ],
  },
  {
    slug: 'mumi-ar',
    ar_type: 'slam',
    difficulty: 'easy',
    duration_minutes: 12,
    requires_outdoors: false,
    featured: false,
    status: 'published',
    location_lat: 43.243,
    location_lng: -5.665,
    translations: [
      { languages_code: 'es', title: 'MUMI Minería AR', description: 'Descubre la maquinaria minera histórica en realidad aumentada en el MUMI.' },
      { languages_code: 'en', title: 'MUMI Mining AR', description: 'Discover historical mining machinery in augmented reality at MUMI.' },
      { languages_code: 'fr', title: 'MUMI Mine AR', description: 'Découvrez les machines minières historiques en réalité augmentée au MUMI.' },
    ],
  },
];

// ============================================
// VR EXPERIENCES
// ============================================

const VR_EXPERIENCES = [
  {
    slug: 'mina-samuno-vr',
    category: 'mine',
    duration_minutes: 15,
    difficulty: 'easy',
    age_rating: '7+',
    motion_sickness_warning: false,
    compatible_devices: ['Quest 2', 'Quest 3', 'Pico 4'],
    status: 'published',
    translations: [
      { languages_code: 'es', title: 'Mina de Samuño VR', description: 'Viaje inmersivo por las galerías reales de la mina del Valle de Samuño. Experimenta la vida del minero asturiano.', short_description: 'Viaje inmersivo por galerías mineras reales' },
      { languages_code: 'en', title: 'Samuño Mine VR', description: 'Immersive journey through the real galleries of the Samuño Valley mine. Experience the life of an Asturian miner.', short_description: 'Immersive journey through real mining galleries' },
      { languages_code: 'fr', title: 'Mine de Samuño VR', description: 'Voyage immersif dans les vraies galeries de la mine de la Vallée de Samuño. Vivez la vie d\'un mineur asturien.', short_description: 'Voyage immersif dans de vraies galeries minières' },
    ],
  },
  {
    slug: 'siderurgia-vr',
    category: 'industry',
    duration_minutes: 12,
    difficulty: 'easy',
    age_rating: '12+',
    motion_sickness_warning: false,
    compatible_devices: ['Quest 2', 'Quest 3', 'Pico 4'],
    status: 'published',
    translations: [
      { languages_code: 'es', title: 'Siderurgia Asturiana VR', description: 'Revive el proceso de fabricación del acero en los altos hornos asturianos del siglo XX.', short_description: 'Revive la fabricación del acero en altos hornos' },
      { languages_code: 'en', title: 'Asturian Steelworks VR', description: 'Relive the steelmaking process in 20th century Asturian blast furnaces.', short_description: 'Relive steelmaking in blast furnaces' },
      { languages_code: 'fr', title: 'Sidérurgie Asturienne VR', description: 'Revivez le processus de fabrication de l\'acier dans les hauts fourneaux asturiens du XXe siècle.', short_description: 'Revivez la fabrication de l\'acier dans les hauts fourneaux' },
    ],
  },
  {
    slug: 'ferrocarril-vr',
    category: 'railway',
    duration_minutes: 10,
    difficulty: 'easy',
    age_rating: '7+',
    motion_sickness_warning: true,
    compatible_devices: ['Quest 2', 'Quest 3', 'Pico 4'],
    status: 'published',
    translations: [
      { languages_code: 'es', title: 'Ferrocarril Minero VR', description: 'Conduce una locomotora de vapor por las vías del ferrocarril minero asturiano.', short_description: 'Conduce una locomotora de vapor minera' },
      { languages_code: 'en', title: 'Mining Railway VR', description: 'Drive a steam locomotive along the tracks of the Asturian mining railway.', short_description: 'Drive a mining steam locomotive' },
      { languages_code: 'fr', title: 'Chemin de Fer Minier VR', description: 'Conduisez une locomotive à vapeur sur les voies du chemin de fer minier asturien.', short_description: 'Conduisez une locomotive à vapeur minière' },
    ],
  },
  {
    slug: 'cueva-tito-bustillo-vr',
    category: 'cave',
    duration_minutes: 20,
    difficulty: 'easy',
    age_rating: '7+',
    motion_sickness_warning: false,
    compatible_devices: ['Quest 2', 'Quest 3', 'Pico 4'],
    status: 'published',
    translations: [
      { languages_code: 'es', title: 'Cueva de Tito Bustillo VR', description: 'Explora las pinturas rupestres de la Cueva de Tito Bustillo en una experiencia VR inmersiva.', short_description: 'Explora pinturas rupestres en VR' },
      { languages_code: 'en', title: 'Tito Bustillo Cave VR', description: 'Explore the cave paintings of Tito Bustillo Cave in an immersive VR experience.', short_description: 'Explore cave paintings in VR' },
      { languages_code: 'fr', title: 'Grotte de Tito Bustillo VR', description: 'Explorez les peintures rupestres de la Grotte de Tito Bustillo dans une expérience VR immersive.', short_description: 'Explorez les peintures rupestres en VR' },
    ],
  },
];

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  SEED AR SCENES + VR EXPERIENCES             ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  console.log('🔐 Logging in...');
  await directus.login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  console.log('✅ Logged in\n');

  console.log('🎯 Seeding AR scenes...\n');
  for (const scene of AR_SCENES) {
    await safeCreate('ar_scenes', { ...scene }, scene.slug);
  }

  console.log('\n🥽 Seeding VR experiences...\n');
  for (const vr of VR_EXPERIENCES) {
    await safeCreate('vr_experiences', { ...vr }, vr.slug);
  }

  console.log('\n✅ Done! AR scenes and VR experiences seeded.');
}

main().catch(e => { console.error('❌ FATAL:', msg(e)); process.exit(1); });

import { createDirectus, rest, authentication, createCollection, createField, deleteCollection, createRelation, createItem } from '@directus/sdk';
import dotenv from 'dotenv';

dotenv.config();

const directus = createDirectus(process.env.PUBLIC_URL || 'http://localhost:8055')
  .with(authentication())
  .with(rest());

// ============================================
// HELPER FUNCTIONS
// ============================================

async function login() {
  console.log('🔐 Logging in to Directus...');
  await directus.login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  console.log('✅ Logged in successfully\n');
}

async function dropCollection(name) {
  try {
    await directus.request(deleteCollection(name));
    console.log(`   🗑️  Dropped: ${name}`);
  } catch {
    // collection doesn't exist — fine
  }
}

async function createCollectionSafe(collectionConfig) {
  const { collection, meta, schema, fields } = collectionConfig;

  try {
    console.log(`\n📦 Creating collection: ${collection}`);

    const primaryKeyField = collectionConfig.primaryKeyType === 'integer'
      ? { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true, readonly: true } }
      : { field: 'id', type: 'uuid', schema: { is_primary_key: true }, meta: { hidden: true, readonly: true } };

    await directus.request(createCollection({
      collection,
      meta,
      schema,
      fields: [primaryKeyField]
    }));

    console.log(`✅ Collection created: ${collection}`);

    if (fields && fields.length > 0) {
      console.log(`   Adding ${fields.length} fields...`);

      for (const field of fields) {
        try {
          await directus.request(createField(collection, field));
          console.log(`   ✓ ${field.field}`);
        } catch (error) {
          if (error.message?.includes('already exists')) {
            console.log(`   ⚠ ${field.field} (already exists)`);
          } else {
            console.error(`   ✗ ${field.field}: ${error.message}`);
          }
        }
      }
    }

    console.log(`✅ ${collection} complete\n`);

  } catch (error) {
    if (error.message?.includes('already exists')) {
      console.log(`⚠️  Collection already exists: ${collection}\n`);
    } else {
      console.error(`❌ Error creating ${collection}:`, error.message);
      throw error;
    }
  }
}

async function createRelationSafe(relation) {
  try {
    await directus.request(createRelation(relation));
    console.log(`   🔗 Relation: ${relation.collection}.${relation.field} → ${relation.related_collection}`);
  } catch (error) {
    if (error.message?.includes('already exists')) {
      console.log(`   ⚠ Relation already exists: ${relation.collection}.${relation.field}`);
    } else {
      console.error(`   ✗ Relation ${relation.collection}.${relation.field}: ${error.message}`);
    }
  }
}

// ============================================
// SHARED HELPERS — reusable field sets
// ============================================

const systemFields = (defaultStatus = 'draft') => [
  { field: 'status', type: 'string', schema: { default_value: defaultStatus }, meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
    { value: 'draft', text: 'Borrador' },
    { value: 'published', text: 'Publicado' },
    { value: 'archived', text: 'Archivado' }
  ] } } },
  { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true } },
  { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', special: ['date-created'], readonly: true, width: 'half' } },
  { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', special: ['date-updated'], readonly: true, width: 'half' } },
];

const seoFields = () => [
  // SEO divider
  { field: 'seo_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'SEO', icon: 'search' } } },
  { field: 'seo_title', type: 'string', schema: { max_length: 70 }, meta: { interface: 'input', width: 'full', note: 'Título SEO (60-70 chars). Si vacío se usa el título principal.' } },
  { field: 'seo_description', type: 'string', schema: { max_length: 160 }, meta: { interface: 'input-multiline', width: 'full', note: 'Meta description (150-160 chars)' } },
  { field: 'seo_keywords', type: 'json', meta: { interface: 'tags', note: 'Keywords separados por coma' } },
];

const statsFields = (extras = []) => [
  { field: 'stats_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Estadísticas', icon: 'bar_chart' } } },
  { field: 'view_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true, width: 'half', note: 'Visitas totales' } },
  ...extras,
];

// ============================================
// COLLECTION DEFINITIONS
// ============================================

const COLLECTIONS = [

  // ============================================
  // 0. LANGUAGES (for translations system)
  // ============================================
  {
    collection: 'languages',
    meta: {
      icon: 'translate',
      note: 'Idiomas disponibles',
      display_template: '{{name}} ({{code}})',
      sort: 0,
      hidden: true,
    },
    schema: { name: 'languages' },
    primaryKeyType: 'skip', // we handle PK manually
    fields: [],
  },

  // ============================================
  // 1. CATEGORIES
  // ============================================
  {
    collection: 'categories',
    meta: {
      icon: 'category',
      note: 'Categorías de contenido (nature, heritage, adventure, gastronomy, culture)',
      display_template: '{{slug}}',
      sort: 1,
    },
    schema: { name: 'categories' },
    fields: [
      { field: 'slug', type: 'string', schema: { is_unique: true, max_length: 50 }, meta: { interface: 'input', required: true, width: 'half', note: 'Identificador único: nature, heritage...' } },
      { field: 'icon', type: 'string', meta: { interface: 'input', width: 'half', note: 'Nombre del icono (Lucide): Mountain, Landmark...' } },
      { field: 'color', type: 'string', meta: { interface: 'select-color', width: 'half' } },
      { field: 'parent_id', type: 'uuid', schema: { foreign_key_table: 'categories' }, meta: { interface: 'select-dropdown-m2o', display_template: '{{slug}}', width: 'half', note: 'Categoría padre (para subcategorías)' } },
      { field: 'order', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', width: 'half' } },
      ...systemFields('published'),
    ],
  },

  // ============================================
  // 1b. CATEGORIES TRANSLATIONS
  // ============================================
  {
    collection: 'categories_translations',
    meta: {
      icon: 'translate',
      hidden: true,
    },
    schema: { name: 'categories_translations' },
    fields: [
      { field: 'categories_id', type: 'uuid', schema: { foreign_key_table: 'categories' }, meta: { hidden: true } },
      { field: 'languages_code', type: 'string', schema: { foreign_key_table: 'languages', foreign_key_column: 'code' }, meta: { hidden: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true, note: 'Nombre de la categoría' } },
      { field: 'description', type: 'text', meta: { interface: 'input-multiline', note: 'Descripción' } },
    ],
  },

  // ============================================
  // 2. MUSEUMS
  // ============================================
  {
    collection: 'museums',
    meta: {
      icon: 'museum',
      note: 'Museos y equipamientos culturales',
      display_template: '{{slug}}',
      sort: 2,
    },
    schema: { name: 'museums' },
    fields: [
      { field: 'slug', type: 'string', schema: { is_unique: true, max_length: 100 }, meta: { interface: 'input', required: true, width: 'half', note: 'URL: /museums/{slug}' } },
      { field: 'museum_code', type: 'string', schema: { is_unique: true, max_length: 20 }, meta: { interface: 'input', width: 'half', note: 'Código interno (MUS-01)' } },

      // Location divider
      { field: 'location_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Ubicación', icon: 'place' } } },
      { field: 'address', type: 'string', meta: { interface: 'input', width: 'full' } },
      { field: 'municipality', type: 'string', meta: { interface: 'input', required: true, width: 'half' } },
      { field: 'postal_code', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'lat', type: 'float', meta: { interface: 'input', required: true, width: 'half', note: 'Latitud' } },
      { field: 'lng', type: 'float', meta: { interface: 'input', required: true, width: 'half', note: 'Longitud' } },

      // Media divider
      { field: 'media_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Media', icon: 'image' } } },
      { field: 'cover_image', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file-image', note: 'Imagen principal (16:9)' } },
      { field: 'gallery', type: 'alias', meta: { interface: 'files', special: ['files'] } },

      // Contact divider
      { field: 'contact_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Contacto', icon: 'phone' } } },
      { field: 'website', type: 'string', meta: { interface: 'input', width: 'third' } },
      { field: 'phone', type: 'string', meta: { interface: 'input', width: 'third' } },
      { field: 'email', type: 'string', meta: { interface: 'input', width: 'third' } },

      // Info
      { field: 'museum_type', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
        { value: 'industrial', text: 'Industrial' },
        { value: 'mining', text: 'Minería' },
        { value: 'railway', text: 'Ferrocarril' },
        { value: 'ethnographic', text: 'Etnográfico' },
        { value: 'art', text: 'Arte' },
        { value: 'science', text: 'Ciencia' },
      ] } } },
      { field: 'featured', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', width: 'half', note: 'Destacado en home' } },
      { field: 'annual_visitors', type: 'integer', meta: { interface: 'input', width: 'half', note: 'Visitantes anuales' } },

      ...seoFields(),
      ...statsFields(),
      ...systemFields(),
    ],
  },

  // ============================================
  // 2b. MUSEUMS TRANSLATIONS
  // ============================================
  {
    collection: 'museums_translations',
    meta: { icon: 'translate', hidden: true },
    schema: { name: 'museums_translations' },
    fields: [
      { field: 'museums_id', type: 'uuid', schema: { foreign_key_table: 'museums' }, meta: { hidden: true } },
      { field: 'languages_code', type: 'string', schema: { foreign_key_table: 'languages', foreign_key_column: 'code' }, meta: { hidden: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true, note: 'Nombre del museo' } },
      { field: 'short_description', type: 'string', schema: { max_length: 300 }, meta: { interface: 'input-multiline', note: 'Descripción corta (cards)' } },
      { field: 'description', type: 'text', meta: { interface: 'input-rich-text-html', note: 'Descripción completa' } },
      { field: 'opening_hours', type: 'text', meta: { interface: 'input-multiline', note: 'Horarios de apertura' } },
      { field: 'prices', type: 'text', meta: { interface: 'input-multiline', note: 'Precios y tarifas' } },
      { field: 'accessibility', type: 'text', meta: { interface: 'input-multiline', note: 'Info de accesibilidad' } },
    ],
  },

  // ============================================
  // 3. TOURS 360° (3DVista builds)
  // ============================================
  {
    collection: 'tours_360',
    meta: {
      icon: 'panorama',
      note: 'Tours virtuales 360° (3DVista) — se suben como ZIP',
      display_template: '{{slug}}',
      sort: 3,
    },
    schema: { name: 'tours_360' },
    fields: [
      { field: 'slug', type: 'string', schema: { is_unique: true, max_length: 100 }, meta: { interface: 'input', required: true, width: 'half', note: 'URL: /tours/{slug}' } },

      // 3DVista Build
      { field: 'build_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Build 3DVista', icon: 'panorama' } } },
      { field: 'build_zip', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', required: true, note: 'ZIP con build de 3DVista (index.html + assets)' } },
      { field: 'build_path', type: 'string', meta: { interface: 'input', readonly: true, note: 'Auto-generado por hook: /tours-builds/{slug}/' } },

      // Preview
      { field: 'thumbnail', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file-image', note: 'Preview image (16:9)' } },
      { field: 'preview_video', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', note: 'Video teaser (opcional)' } },

      // Relations
      { field: 'museum_id', type: 'uuid', schema: { foreign_key_table: 'museums' }, meta: { interface: 'select-dropdown-m2o', display_template: '{{slug}}', note: 'Museo asociado' } },

      // Metadata
      { field: 'meta_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Metadatos', icon: 'info' } } },
      { field: 'total_panoramas', type: 'integer', meta: { interface: 'input', width: 'half', note: 'Número de panoramas' } },
      { field: 'duration_minutes', type: 'integer', meta: { interface: 'input', width: 'half', note: 'Duración estimada' } },
      { field: 'has_audio', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', width: 'half', note: 'Tiene audioguías integradas' } },
      { field: 'vr_compatible', type: 'boolean', schema: { default_value: true }, meta: { interface: 'boolean', width: 'half', note: 'Compatible con gafas VR' } },

      ...seoFields(),
      ...statsFields([
        { field: 'average_duration_seconds', type: 'integer', meta: { interface: 'input', readonly: true, width: 'half', note: 'Duración media real' } },
      ]),
      ...systemFields(),
    ],
  },

  // ============================================
  // 3b. TOURS 360 TRANSLATIONS
  // ============================================
  {
    collection: 'tours_360_translations',
    meta: { icon: 'translate', hidden: true },
    schema: { name: 'tours_360_translations' },
    fields: [
      { field: 'tours_360_id', type: 'uuid', schema: { foreign_key_table: 'tours_360' }, meta: { hidden: true } },
      { field: 'languages_code', type: 'string', schema: { foreign_key_table: 'languages', foreign_key_column: 'code' }, meta: { hidden: true } },
      { field: 'title', type: 'string', meta: { interface: 'input', required: true, note: 'Título del tour' } },
      { field: 'description', type: 'text', meta: { interface: 'input-multiline', note: 'Descripción del tour' } },
    ],
  },

  // ============================================
  // 4. AR SCENES (Needle Engine builds)
  // ============================================
  {
    collection: 'ar_scenes',
    meta: {
      icon: 'view_in_ar',
      note: 'Experiencias AR (Needle Engine) — se suben como ZIP',
      display_template: '{{slug}}',
      sort: 4,
    },
    schema: { name: 'ar_scenes' },
    fields: [
      { field: 'slug', type: 'string', schema: { is_unique: true, max_length: 100 }, meta: { interface: 'input', required: true, width: 'half', note: 'URL: /ar/{slug}' } },

      // Needle Build
      { field: 'build_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Build Needle Engine', icon: 'view_in_ar' } } },
      { field: 'build_zip', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', required: true, note: 'ZIP con build de Needle Engine' } },
      { field: 'build_path', type: 'string', meta: { interface: 'input', readonly: true, note: 'Auto-generado por hook' } },

      // AR Type
      { field: 'ar_type', type: 'string', schema: { default_value: 'slam' }, meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [
        { value: 'slam', text: 'Surface Detection (SLAM)' },
        { value: 'image-tracking', text: 'Image Tracking (Marker)' },
        { value: 'geo', text: 'Geo-positioned AR' },
      ] } } },
      { field: 'difficulty', type: 'string', schema: { default_value: 'easy' }, meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
        { value: 'easy', text: 'Fácil' },
        { value: 'moderate', text: 'Moderado' },
        { value: 'advanced', text: 'Avanzado' },
      ] } } },

      // Geo AR
      { field: 'geo_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Geolocalización AR', icon: 'my_location' } } },
      { field: 'location_lat', type: 'float', meta: { interface: 'input', width: 'half', note: 'Solo para geo AR' } },
      { field: 'location_lng', type: 'float', meta: { interface: 'input', width: 'half' } },
      { field: 'location_radius_meters', type: 'integer', schema: { default_value: 50 }, meta: { interface: 'input', width: 'half', note: 'Radio de activación (metros)' } },

      // Image Tracking
      { field: 'tracking_marker', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file-image', note: 'Marcador para imprimir (A4)' } },
      { field: 'marker_size_cm', type: 'integer', meta: { interface: 'input', width: 'half', note: 'Tamaño del marcador impreso (cm)' } },

      // Media
      { field: 'media_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Media', icon: 'image' } } },
      { field: 'preview_image', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file-image', required: true, note: 'Hero image' } },
      { field: 'preview_video', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', note: 'Video demo' } },

      // Metadata
      { field: 'duration_minutes', type: 'integer', schema: { default_value: 10 }, meta: { interface: 'input', width: 'half' } },
      { field: 'requires_outdoors', type: 'boolean', schema: { default_value: true }, meta: { interface: 'boolean', width: 'half', note: '¿Requiere exterior?' } },
      { field: 'featured', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', width: 'half' } },

      ...seoFields(),
      ...statsFields([
        { field: 'launch_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true, width: 'half', note: 'Lanzamientos' } },
        { field: 'completion_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true, width: 'half', note: 'Completados' } },
      ]),
      ...systemFields(),
    ],
  },

  // ============================================
  // 4b. AR SCENES TRANSLATIONS
  // ============================================
  {
    collection: 'ar_scenes_translations',
    meta: { icon: 'translate', hidden: true },
    schema: { name: 'ar_scenes_translations' },
    fields: [
      { field: 'ar_scenes_id', type: 'uuid', schema: { foreign_key_table: 'ar_scenes' }, meta: { hidden: true } },
      { field: 'languages_code', type: 'string', schema: { foreign_key_table: 'languages', foreign_key_column: 'code' }, meta: { hidden: true } },
      { field: 'title', type: 'string', meta: { interface: 'input', required: true, note: 'Título de la escena AR' } },
      { field: 'description', type: 'text', meta: { interface: 'input-rich-text-html', note: 'Descripción completa' } },
      { field: 'instructions', type: 'text', meta: { interface: 'input-multiline', note: 'Instrucciones de uso para el visitante' } },
    ],
  },

  // ============================================
  // 5. VR EXPERIENCES
  // ============================================
  {
    collection: 'vr_experiences',
    meta: {
      icon: 'sports_esports',
      note: 'Experiencias VR (APK para headsets)',
      display_template: '{{slug}}',
      sort: 5,
    },
    schema: { name: 'vr_experiences' },
    fields: [
      { field: 'slug', type: 'string', schema: { is_unique: true, max_length: 100 }, meta: { interface: 'input', required: true, width: 'half' } },

      // Category
      { field: 'category', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
        { value: 'mine', text: 'Mina' },
        { value: 'industry', text: 'Industria/Siderurgia' },
        { value: 'railway', text: 'Ferrocarril' },
        { value: 'cave', text: 'Cueva/Arte Rupestre' },
        { value: 'heritage', text: 'Patrimonio' },
        { value: 'nature', text: 'Naturaleza' },
      ] } } },

      // Files
      { field: 'files_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Archivos', icon: 'folder' } } },
      { field: 'apk_file', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', required: true, note: 'APK para Pico 4 / Quest (hasta 500MB)' } },
      { field: 'apk_version', type: 'string', meta: { interface: 'input', width: 'half', note: 'Versión (1.0.0)' } },
      { field: 'apk_size_mb', type: 'float', meta: { interface: 'input', readonly: true, width: 'half', note: 'Tamaño en MB' } },

      // Media
      { field: 'media_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Media', icon: 'image' } } },
      { field: 'thumbnail', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file-image', required: true } },
      { field: 'preview_video', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', note: 'Teaser video' } },
      { field: 'screenshots', type: 'alias', meta: { interface: 'files', special: ['files'], note: 'Screenshots de la experiencia' } },

      // Metadata
      { field: 'meta_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Metadatos', icon: 'info' } } },
      { field: 'duration_minutes', type: 'integer', meta: { interface: 'input', width: 'half', note: 'Duración estimada' } },
      { field: 'difficulty', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
        { value: 'easy', text: 'Fácil' },
        { value: 'moderate', text: 'Moderado' },
      ] } } },
      { field: 'age_rating', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
        { value: '7+', text: '7+' },
        { value: '12+', text: '12+' },
        { value: '16+', text: '16+' },
      ] } } },
      { field: 'motion_sickness_warning', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', width: 'half' } },
      { field: 'compatible_devices', type: 'json', meta: { interface: 'tags', note: 'Dispositivos compatibles: Quest 2, Quest 3, Pico 4...' } },

      ...seoFields(),
      ...statsFields([
        { field: 'download_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true, width: 'half', note: 'Descargas' } },
      ]),
      ...systemFields(),
    ],
  },

  // ============================================
  // 5b. VR EXPERIENCES TRANSLATIONS
  // ============================================
  {
    collection: 'vr_experiences_translations',
    meta: { icon: 'translate', hidden: true },
    schema: { name: 'vr_experiences_translations' },
    fields: [
      { field: 'vr_experiences_id', type: 'uuid', schema: { foreign_key_table: 'vr_experiences' }, meta: { hidden: true } },
      { field: 'languages_code', type: 'string', schema: { foreign_key_table: 'languages', foreign_key_column: 'code' }, meta: { hidden: true } },
      { field: 'title', type: 'string', meta: { interface: 'input', required: true, note: 'Título de la experiencia VR' } },
      { field: 'description', type: 'text', meta: { interface: 'input-rich-text-html', note: 'Descripción completa' } },
      { field: 'short_description', type: 'string', schema: { max_length: 300 }, meta: { interface: 'input-multiline', note: 'Descripción corta (cards)' } },
    ],
  },

  // ============================================
  // 6. ROUTES (Immersive Routes)
  // ============================================
  {
    collection: 'routes',
    meta: {
      icon: 'route',
      note: 'Rutas turísticas inmersivas (29 rutas)',
      display_template: '{{route_code}} · {{slug}}',
      sort: 6,
    },
    schema: { name: 'routes' },
    fields: [
      { field: 'route_code', type: 'string', schema: { is_unique: true, max_length: 20 }, meta: { interface: 'input', required: true, width: 'half', note: 'Código: AR-1, AR-2...' } },
      { field: 'slug', type: 'string', schema: { is_unique: true, max_length: 100 }, meta: { interface: 'input', required: true, width: 'half' } },

      // Media
      { field: 'media_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Media', icon: 'image' } } },
      { field: 'cover_image', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file-image', required: true } },
      { field: 'gallery', type: 'alias', meta: { interface: 'files', special: ['files'] } },

      // Route Data
      { field: 'route_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Datos de la ruta', icon: 'straighten' } } },
      { field: 'difficulty', type: 'string', schema: { default_value: 'easy' }, meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
        { value: 'easy', text: 'Fácil' },
        { value: 'medium', text: 'Moderado' },
        { value: 'hard', text: 'Difícil' },
      ] } } },
      { field: 'is_circular', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', width: 'half' } },
      { field: 'max_points', type: 'integer', meta: { interface: 'input', width: 'half', note: 'Máximo de puntos en la ruta' } },
      { field: 'distance_km', type: 'float', meta: { interface: 'input', width: 'half', note: 'Distancia total (km)' } },
      { field: 'elevation_gain_meters', type: 'integer', meta: { interface: 'input', width: 'half' } },
      { field: 'surface_type', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
        { value: 'paved', text: 'Asfaltado' },
        { value: 'gravel', text: 'Grava' },
        { value: 'dirt', text: 'Tierra' },
        { value: 'mixed', text: 'Mixto' },
      ] } } },

      // Location
      { field: 'location_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Ubicación', icon: 'place' } } },
      { field: 'center_lat', type: 'float', meta: { interface: 'input', width: 'half', note: 'Centro del mapa' } },
      { field: 'center_lng', type: 'float', meta: { interface: 'input', width: 'half' } },
      { field: 'polyline', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: 'Array de {lat, lng}' } },
      { field: 'gpx_file', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', note: 'GPX track' } },

      // Flags
      { field: 'featured', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', width: 'half' } },

      ...seoFields(),
      ...statsFields([
        { field: 'completion_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true, width: 'half', note: 'Completadas' } },
      ]),
      ...systemFields(),
    ],
  },

  // ============================================
  // 6b. ROUTES TRANSLATIONS
  // ============================================
  {
    collection: 'routes_translations',
    meta: { icon: 'translate', hidden: true },
    schema: { name: 'routes_translations' },
    fields: [
      { field: 'routes_id', type: 'uuid', schema: { foreign_key_table: 'routes' }, meta: { hidden: true } },
      { field: 'languages_code', type: 'string', schema: { foreign_key_table: 'languages', foreign_key_column: 'code' }, meta: { hidden: true } },
      { field: 'title', type: 'string', meta: { interface: 'input', required: true, note: 'Título de la ruta' } },
      { field: 'short_description', type: 'string', schema: { max_length: 500 }, meta: { interface: 'input-multiline', note: 'Descripción corta (cards)' } },
      { field: 'description', type: 'text', meta: { interface: 'input-rich-text-html', note: 'Descripción completa' } },
      { field: 'theme', type: 'string', meta: { interface: 'input', note: 'Tema: Minería e industria, Gastronomía...' } },
      { field: 'duration', type: 'string', meta: { interface: 'input', note: 'Duración: 1 día, 4-5 horas...' } },
    ],
  },

  // ============================================
  // 6c. ROUTES ↔ CATEGORIES (M2M junction)
  // ============================================
  {
    collection: 'routes_categories',
    meta: {
      icon: 'link',
      hidden: true,
    },
    schema: { name: 'routes_categories' },
    fields: [
      { field: 'routes_id', type: 'uuid', schema: { foreign_key_table: 'routes' }, meta: { hidden: true } },
      { field: 'categories_id', type: 'uuid', schema: { foreign_key_table: 'categories' }, meta: { hidden: true } },
    ],
  },

  // ============================================
  // 7. POIs (Points of Interest)
  // ============================================
  {
    collection: 'pois',
    meta: {
      icon: 'place',
      note: 'Puntos de interés — POIs independientes y puntos de ruta',
      display_template: '{{slug}}',
      sort: 7,
    },
    schema: { name: 'pois' },
    fields: [
      { field: 'slug', type: 'string', schema: { is_unique: true, max_length: 100 }, meta: { interface: 'input', required: true, width: 'half', note: 'Identificador único' } },

      // Type
      { field: 'experience_type', type: 'string', schema: { default_value: 'INFO' }, meta: { interface: 'select-dropdown', required: true, width: 'half', note: 'Tipo de experiencia principal', options: { choices: [
        { value: 'AR', text: 'Realidad Aumentada' },
        { value: '360', text: 'Tour 360°' },
        { value: 'INFO', text: 'Informativo' },
        { value: 'VR', text: 'Realidad Virtual' },
      ] } } },

      // Route relation (optional — POI can be standalone)
      { field: 'route_id', type: 'uuid', schema: { foreign_key_table: 'routes', is_nullable: true }, meta: { interface: 'select-dropdown-m2o', display_template: '{{route_code}} · {{slug}}', note: 'Ruta asociada (si es punto de ruta)' } },
      { field: 'order', type: 'integer', meta: { interface: 'input', width: 'half', note: 'Orden en la ruta (1, 2, 3...)' } },

      // Location
      { field: 'location_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Ubicación', icon: 'place' } } },
      { field: 'lat', type: 'float', meta: { interface: 'input', required: true, width: 'half' } },
      { field: 'lng', type: 'float', meta: { interface: 'input', required: true, width: 'half' } },
      { field: 'address', type: 'string', meta: { interface: 'input', width: 'full' } },

      // Media
      { field: 'media_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Media', icon: 'image' } } },
      { field: 'cover_image', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file-image' } },
      { field: 'gallery', type: 'alias', meta: { interface: 'files', special: ['files'] } },

      // Audio guides
      { field: 'audio_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Audioguías', icon: 'headphones' } } },
      { field: 'audio_es', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', width: 'third', note: 'MP3 español' } },
      { field: 'audio_en', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', width: 'third', note: 'MP3 inglés' } },
      { field: 'audio_fr', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', width: 'third', note: 'MP3 francés' } },
      { field: 'audio_duration_seconds', type: 'integer', meta: { interface: 'input', readonly: true, width: 'half', note: 'Duración auto-detectada' } },

      // Video
      { field: 'video_url', type: 'string', meta: { interface: 'input', note: 'URL de video (YouTube, Vimeo...)' } },

      // Related content
      { field: 'relations_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Contenido relacionado', icon: 'link' } } },
      { field: 'ar_scene_id', type: 'uuid', schema: { foreign_key_table: 'ar_scenes', is_nullable: true }, meta: { interface: 'select-dropdown-m2o', display_template: '{{slug}}', note: 'Escena AR en este POI' } },
      { field: 'tour_360_id', type: 'uuid', schema: { foreign_key_table: 'tours_360', is_nullable: true }, meta: { interface: 'select-dropdown-m2o', display_template: '{{slug}}', note: 'Tour 360° en este POI' } },
      { field: 'museum_id', type: 'uuid', schema: { foreign_key_table: 'museums', is_nullable: true }, meta: { interface: 'select-dropdown-m2o', display_template: '{{slug}}', note: 'Si el POI es un museo' } },

      // Rich content
      { field: 'content_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Contenido enriquecido', icon: 'article' } } },
      { field: 'rich_text', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: 'Bloques de contenido: {blocks: [{type: paragraph|highlight|bullets|quote, ...}]}' } },
      { field: 'tags', type: 'json', meta: { interface: 'tags', note: 'Etiquetas para búsqueda y filtrado' } },

      // Contact
      { field: 'contact_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Contacto', icon: 'phone' } } },
      { field: 'phone', type: 'string', meta: { interface: 'input', width: 'third' } },
      { field: 'email', type: 'string', meta: { interface: 'input', width: 'third' } },
      { field: 'website', type: 'string', meta: { interface: 'input', width: 'third' } },
      { field: 'share_url', type: 'string', meta: { interface: 'input', note: 'URL para compartir' } },

      // External links
      { field: 'external_links', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: 'Array de {label: {es,en,fr}, url}' } },

      // Flags
      { field: 'is_required', type: 'boolean', schema: { default_value: true }, meta: { interface: 'boolean', width: 'half', note: '¿Punto obligatorio en la ruta?' } },
      { field: 'featured', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', width: 'half' } },

      ...seoFields(),
      ...statsFields(),
      ...systemFields(),
    ],
  },

  // ============================================
  // 7b. POIs TRANSLATIONS
  // ============================================
  {
    collection: 'pois_translations',
    meta: { icon: 'translate', hidden: true },
    schema: { name: 'pois_translations' },
    fields: [
      { field: 'pois_id', type: 'uuid', schema: { foreign_key_table: 'pois' }, meta: { hidden: true } },
      { field: 'languages_code', type: 'string', schema: { foreign_key_table: 'languages', foreign_key_column: 'code' }, meta: { hidden: true } },
      { field: 'title', type: 'string', meta: { interface: 'input', required: true, note: 'Título del POI' } },
      { field: 'short_description', type: 'string', schema: { max_length: 500 }, meta: { interface: 'input-multiline', note: 'Descripción corta (cards)' } },
      { field: 'description', type: 'text', meta: { interface: 'input-rich-text-html', note: 'Descripción completa' } },
      // Practical info
      { field: 'how_to_get', type: 'text', meta: { interface: 'input-multiline', note: 'Cómo llegar' } },
      { field: 'accessibility', type: 'text', meta: { interface: 'input-multiline', note: 'Información de accesibilidad' } },
      { field: 'parking', type: 'text', meta: { interface: 'input-multiline', note: 'Información de aparcamiento' } },
      { field: 'opening_hours', type: 'text', meta: { interface: 'input-multiline', note: 'Horarios de apertura' } },
      { field: 'prices', type: 'text', meta: { interface: 'input-multiline', note: 'Precios y tarifas' } },
      { field: 'recommended_duration', type: 'string', meta: { interface: 'input', note: 'Duración recomendada: 2-4 horas' } },
    ],
  },

  // ============================================
  // 7c. POIs ↔ CATEGORIES (M2M junction)
  // ============================================
  {
    collection: 'pois_categories',
    meta: { icon: 'link', hidden: true },
    schema: { name: 'pois_categories' },
    fields: [
      { field: 'pois_id', type: 'uuid', schema: { foreign_key_table: 'pois' }, meta: { hidden: true } },
      { field: 'categories_id', type: 'uuid', schema: { foreign_key_table: 'categories' }, meta: { hidden: true } },
    ],
  },

  // ============================================
  // 8. ANALYTICS EVENTS
  // ============================================
  {
    collection: 'analytics_events',
    meta: {
      icon: 'analytics',
      note: 'Eventos de usuarios para reportes',
      display_template: '{{event_type}} — {{created_at}}',
      sort: 8,
    },
    schema: { name: 'analytics_events' },
    fields: [
      { field: 'event_type', type: 'string', meta: { interface: 'select-dropdown', required: true, options: { choices: [
        { value: 'page_view', text: 'Vista de página' },
        { value: 'museum_viewed', text: 'Museo visto' },
        { value: 'tour_360_started', text: 'Tour 360° iniciado' },
        { value: 'tour_360_completed', text: 'Tour 360° completado' },
        { value: 'ar_launched', text: 'AR lanzado' },
        { value: 'ar_completed', text: 'AR completado' },
        { value: 'ar_error', text: 'AR error' },
        { value: 'vr_downloaded', text: 'VR descargado' },
        { value: 'audio_played', text: 'Audio reproducido' },
        { value: 'audio_completed', text: 'Audio completado' },
        { value: 'gpx_downloaded', text: 'GPX descargado' },
        { value: 'route_started', text: 'Ruta iniciada' },
        { value: 'route_completed', text: 'Ruta completada' },
        { value: 'poi_visited', text: 'POI visitado' },
        { value: 'search', text: 'Búsqueda' },
        { value: 'share', text: 'Compartir' },
        { value: 'fullscreen_opened', text: 'Pantalla completa' },
        { value: 'language_changed', text: 'Cambio de idioma' },
        { value: 'cookie_consent', text: 'Consentimiento cookies' },
      ] } } },
      { field: 'resource_type', type: 'string', meta: { interface: 'input', width: 'half', note: 'museums | tours_360 | ar_scenes | routes | pois' } },
      { field: 'resource_id', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'session_id', type: 'string', meta: { interface: 'input', note: 'UUID de sesión' } },
      { field: 'device_type', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
        { value: 'mobile', text: 'Móvil' },
        { value: 'tablet', text: 'Tablet' },
        { value: 'desktop', text: 'Desktop' },
        { value: 'vr', text: 'VR Headset' },
      ] } } },
      { field: 'user_agent', type: 'string', meta: { interface: 'input', readonly: true, width: 'half' } },
      { field: 'language', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
        { value: 'es', text: 'Español' },
        { value: 'en', text: 'English' },
        { value: 'fr', text: 'Français' },
      ] } } },
      { field: 'duration_seconds', type: 'integer', meta: { interface: 'input', width: 'half', note: 'Duración del evento' } },
      { field: 'completion_percentage', type: 'integer', meta: { interface: 'input', width: 'half', note: '0-100' } },
      { field: 'municipality', type: 'string', meta: { interface: 'input', width: 'half', note: 'Solo municipio (GDPR)' } },
      { field: 'extra_data', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: 'Datos adicionales del evento' } },
      { field: 'created_at', type: 'timestamp', meta: { special: ['date-created'], readonly: true, required: true } },
    ],
  },
];

// ============================================
// RELATIONS CONFIGURATION
// ============================================

const RELATIONS = [
  // --- Categories self-reference ---
  {
    collection: 'categories',
    field: 'parent_id',
    related_collection: 'categories',
    meta: { one_field: 'children', sort_field: 'order' },
    schema: { on_delete: 'SET NULL' },
  },

  // --- Categories translations ---
  {
    collection: 'categories_translations',
    field: 'categories_id',
    related_collection: 'categories',
    meta: { one_field: 'translations', junction_field: 'languages_code' },
    schema: { on_delete: 'CASCADE' },
  },
  {
    collection: 'categories_translations',
    field: 'languages_code',
    related_collection: 'languages',
    meta: { one_field: null, junction_field: 'categories_id' },
    schema: { on_delete: 'CASCADE' },
  },

  // --- Museums translations ---
  {
    collection: 'museums_translations',
    field: 'museums_id',
    related_collection: 'museums',
    meta: { one_field: 'translations', junction_field: 'languages_code' },
    schema: { on_delete: 'CASCADE' },
  },
  {
    collection: 'museums_translations',
    field: 'languages_code',
    related_collection: 'languages',
    meta: { one_field: null, junction_field: 'museums_id' },
    schema: { on_delete: 'CASCADE' },
  },

  // --- Tours 360 → Museum ---
  {
    collection: 'tours_360',
    field: 'museum_id',
    related_collection: 'museums',
    meta: { one_field: 'tours_360' },
    schema: { on_delete: 'SET NULL' },
  },
  // --- Tours 360 translations ---
  {
    collection: 'tours_360_translations',
    field: 'tours_360_id',
    related_collection: 'tours_360',
    meta: { one_field: 'translations', junction_field: 'languages_code' },
    schema: { on_delete: 'CASCADE' },
  },
  {
    collection: 'tours_360_translations',
    field: 'languages_code',
    related_collection: 'languages',
    meta: { one_field: null, junction_field: 'tours_360_id' },
    schema: { on_delete: 'CASCADE' },
  },

  // --- AR Scenes translations ---
  {
    collection: 'ar_scenes_translations',
    field: 'ar_scenes_id',
    related_collection: 'ar_scenes',
    meta: { one_field: 'translations', junction_field: 'languages_code' },
    schema: { on_delete: 'CASCADE' },
  },
  {
    collection: 'ar_scenes_translations',
    field: 'languages_code',
    related_collection: 'languages',
    meta: { one_field: null, junction_field: 'ar_scenes_id' },
    schema: { on_delete: 'CASCADE' },
  },

  // --- VR Experiences translations ---
  {
    collection: 'vr_experiences_translations',
    field: 'vr_experiences_id',
    related_collection: 'vr_experiences',
    meta: { one_field: 'translations', junction_field: 'languages_code' },
    schema: { on_delete: 'CASCADE' },
  },
  {
    collection: 'vr_experiences_translations',
    field: 'languages_code',
    related_collection: 'languages',
    meta: { one_field: null, junction_field: 'vr_experiences_id' },
    schema: { on_delete: 'CASCADE' },
  },

  // --- Routes translations ---
  {
    collection: 'routes_translations',
    field: 'routes_id',
    related_collection: 'routes',
    meta: { one_field: 'translations', junction_field: 'languages_code' },
    schema: { on_delete: 'CASCADE' },
  },
  {
    collection: 'routes_translations',
    field: 'languages_code',
    related_collection: 'languages',
    meta: { one_field: null, junction_field: 'routes_id' },
    schema: { on_delete: 'CASCADE' },
  },

  // --- Routes ↔ Categories M2M ---
  {
    collection: 'routes_categories',
    field: 'routes_id',
    related_collection: 'routes',
    meta: { one_field: 'categories', junction_field: 'categories_id' },
    schema: { on_delete: 'CASCADE' },
  },
  {
    collection: 'routes_categories',
    field: 'categories_id',
    related_collection: 'categories',
    meta: { one_field: 'routes', junction_field: 'routes_id' },
    schema: { on_delete: 'CASCADE' },
  },

  // --- POIs → Route ---
  {
    collection: 'pois',
    field: 'route_id',
    related_collection: 'routes',
    meta: { one_field: 'points', sort_field: 'order' },
    schema: { on_delete: 'SET NULL' },
  },
  // --- POIs → AR Scene ---
  {
    collection: 'pois',
    field: 'ar_scene_id',
    related_collection: 'ar_scenes',
    meta: { one_field: 'pois' },
    schema: { on_delete: 'SET NULL' },
  },
  // --- POIs → Tour 360 ---
  {
    collection: 'pois',
    field: 'tour_360_id',
    related_collection: 'tours_360',
    meta: { one_field: 'pois' },
    schema: { on_delete: 'SET NULL' },
  },
  // --- POIs → Museum ---
  {
    collection: 'pois',
    field: 'museum_id',
    related_collection: 'museums',
    meta: { one_field: 'pois' },
    schema: { on_delete: 'SET NULL' },
  },

  // --- POIs translations ---
  {
    collection: 'pois_translations',
    field: 'pois_id',
    related_collection: 'pois',
    meta: { one_field: 'translations', junction_field: 'languages_code' },
    schema: { on_delete: 'CASCADE' },
  },
  {
    collection: 'pois_translations',
    field: 'languages_code',
    related_collection: 'languages',
    meta: { one_field: null, junction_field: 'pois_id' },
    schema: { on_delete: 'CASCADE' },
  },

  // --- POIs ↔ Categories M2M ---
  {
    collection: 'pois_categories',
    field: 'pois_id',
    related_collection: 'pois',
    meta: { one_field: 'categories', junction_field: 'categories_id' },
    schema: { on_delete: 'CASCADE' },
  },
  {
    collection: 'pois_categories',
    field: 'categories_id',
    related_collection: 'categories',
    meta: { one_field: 'pois', junction_field: 'pois_id' },
    schema: { on_delete: 'CASCADE' },
  },
];

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  ASTURIAS XR — RECREATE DATABASE SCHEMA      ║');
  console.log('║  Translations · M2M · Rich Content           ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  await login();

  // ── STEP 1: Drop all existing collections (reverse order) ──
  console.log('🗑️  Dropping existing collections...\n');

  const dropOrder = [
    'analytics_events',
    'pois_categories',
    'pois_translations',
    'pois',
    'routes_categories',
    'routes_translations',
    'routes',
    'vr_experiences_translations',
    'vr_experiences',
    'ar_scenes_translations',
    'ar_scenes',
    'tours_360_translations',
    'tours_360',
    'museums_translations',
    'museums',
    'categories_translations',
    'categories',
    'languages',
  ];

  for (const name of dropOrder) {
    await dropCollection(name);
  }
  console.log('');

  // ── STEP 2: Create languages collection manually (string PK) ──
  console.log('🌐 Creating languages collection with string PK...\n');

  try {
    await directus.request(createCollection({
      collection: 'languages',
      meta: {
        icon: 'translate',
        note: 'Idiomas disponibles',
        display_template: '{{name}} ({{code}})',
        sort: 0,
        hidden: true,
      },
      schema: { name: 'languages' },
      fields: [
        {
          field: 'code',
          type: 'string',
          schema: { is_primary_key: true, max_length: 5 },
          meta: { interface: 'input', required: true, readonly: true, width: 'half', note: 'ISO 639-1: es, en, fr' },
        },
        {
          field: 'name',
          type: 'string',
          meta: { interface: 'input', required: true, width: 'half', note: 'Español, English, Français' },
        },
        {
          field: 'direction',
          type: 'string',
          schema: { default_value: 'ltr' },
          meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
            { value: 'ltr', text: 'Left to Right' },
            { value: 'rtl', text: 'Right to Left' },
          ] } },
        },
      ],
    }));
    console.log('✅ languages collection created\n');
  } catch (error) {
    console.error('❌ Error creating languages:', error.message);
  }

  // Seed languages
  console.log('🌐 Seeding languages...\n');
  const langs = [
    { code: 'es', name: 'Español', direction: 'ltr' },
    { code: 'en', name: 'English', direction: 'ltr' },
    { code: 'fr', name: 'Français', direction: 'ltr' },
  ];
  for (const lang of langs) {
    try {
      await directus.request(createItem('languages', lang));
      console.log(`   ✓ ${lang.code} — ${lang.name}`);
    } catch (error) {
      console.log(`   ⚠ ${lang.code}: ${error.message}`);
    }
  }
  console.log('');

  // ── STEP 3: Create all collections (skip languages, already done) ──
  console.log(`📊 Creating ${COLLECTIONS.length - 1} collections...\n`);

  for (const collectionConfig of COLLECTIONS) {
    if (collectionConfig.collection === 'languages') continue; // already created
    await createCollectionSafe(collectionConfig);
  }

  // ── STEP 4: Create relations ──
  console.log('\n🔗 Creating relations...\n');

  for (const relation of RELATIONS) {
    await createRelationSafe(relation);
  }

  // ── STEP 5: Configure translations fields on parent collections ──
  console.log('\n🌐 Configuring translations fields...\n');

  const translationConfigs = [
    { parent: 'categories', junction: 'categories_translations' },
    { parent: 'museums', junction: 'museums_translations' },
    { parent: 'tours_360', junction: 'tours_360_translations' },
    { parent: 'ar_scenes', junction: 'ar_scenes_translations' },
    { parent: 'vr_experiences', junction: 'vr_experiences_translations' },
    { parent: 'routes', junction: 'routes_translations' },
    { parent: 'pois', junction: 'pois_translations' },
  ];

  for (const config of translationConfigs) {
    try {
      await directus.request(createField(config.parent, {
        field: 'translations',
        type: 'alias',
        meta: {
          interface: 'translations',
          special: ['translations'],
          options: {
            languageField: 'name',
          },
        },
      }));
      console.log(`   ✓ ${config.parent}.translations`);
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log(`   ⚠ ${config.parent}.translations (already exists)`);
      } else {
        console.error(`   ✗ ${config.parent}.translations: ${error.message}`);
      }
    }
  }

  // ── STEP 6: Configure M2M fields on parent collections ──
  console.log('\n🔗 Configuring M2M fields...\n');

  const m2mConfigs = [
    { parent: 'routes', field: 'categories', junction: 'routes_categories', relatedCollection: 'categories', junctionFieldThis: 'routes_id', junctionFieldRelated: 'categories_id', template: '{{categories_id.slug}}' },
    { parent: 'pois', field: 'categories', junction: 'pois_categories', relatedCollection: 'categories', junctionFieldThis: 'pois_id', junctionFieldRelated: 'categories_id', template: '{{categories_id.slug}}' },
  ];

  for (const config of m2mConfigs) {
    try {
      await directus.request(createField(config.parent, {
        field: config.field,
        type: 'alias',
        meta: {
          interface: 'list-m2m',
          special: ['m2m'],
          options: {
            template: config.template,
          },
        },
      }));
      console.log(`   ✓ ${config.parent}.${config.field} (M2M)`);
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log(`   ⚠ ${config.parent}.${config.field} (already exists)`);
      } else {
        console.error(`   ✗ ${config.parent}.${config.field}: ${error.message}`);
      }
    }
  }

  // ── STEP 7: Configure O2M fields (reverse relations) ──
  console.log('\n🔗 Configuring O2M fields...\n');

  const o2mConfigs = [
    { parent: 'museums', field: 'tours_360', relatedCollection: 'tours_360', foreignKey: 'museum_id', template: '{{slug}}' },
    { parent: 'museums', field: 'pois', relatedCollection: 'pois', foreignKey: 'museum_id', template: '{{slug}}' },
    { parent: 'routes', field: 'points', relatedCollection: 'pois', foreignKey: 'route_id', template: '{{order}} · {{slug}}', sortField: 'order' },
    { parent: 'ar_scenes', field: 'pois', relatedCollection: 'pois', foreignKey: 'ar_scene_id', template: '{{slug}}' },
    { parent: 'tours_360', field: 'pois', relatedCollection: 'pois', foreignKey: 'tour_360_id', template: '{{slug}}' },
    { parent: 'categories', field: 'children', relatedCollection: 'categories', foreignKey: 'parent_id', template: '{{slug}}', sortField: 'order' },
  ];

  for (const config of o2mConfigs) {
    try {
      await directus.request(createField(config.parent, {
        field: config.field,
        type: 'alias',
        meta: {
          interface: 'list-o2m',
          special: ['o2m'],
          options: {
            template: config.template,
          },
        },
      }));
      console.log(`   ✓ ${config.parent}.${config.field} (O2M → ${config.relatedCollection})`);
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log(`   ⚠ ${config.parent}.${config.field} (already exists)`);
      } else {
        console.error(`   ✗ ${config.parent}.${config.field}: ${error.message}`);
      }
    }
  }

  // ── DONE ──
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  ✅ DATABASE SCHEMA RECREATED SUCCESSFULLY!   ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  console.log('📋 Collections created:');
  const mainCollections = COLLECTIONS.filter(c => !c.collection.includes('_translations') && !c.collection.includes('_categories') && c.collection !== 'languages');
  mainCollections.forEach((col, i) => {
    console.log(`   ${i + 1}. ${col.collection} (${col.fields?.length || 0} fields)`);
  });

  console.log('\n📋 Translation tables:');
  COLLECTIONS.filter(c => c.collection.includes('_translations')).forEach(col => {
    console.log(`   · ${col.collection}`);
  });

  console.log('\n📋 Junction tables (M2M):');
  COLLECTIONS.filter(c => c.collection.includes('_categories')).forEach(col => {
    console.log(`   · ${col.collection}`);
  });

  console.log('\n🌐 Languages: es (Español), en (English), fr (Français)');

  console.log('\n📐 Schema overview:');
  console.log('   museums ──O2M──→ tours_360');
  console.log('   museums ──O2M──→ pois');
  console.log('   routes  ──O2M──→ pois (ordered)');
  console.log('   routes  ──M2M──→ categories');
  console.log('   pois    ──M2M──→ categories');
  console.log('   pois    ──M2O──→ ar_scenes');
  console.log('   pois    ──M2O──→ tours_360');
  console.log('   pois    ──M2O──→ museums');
  console.log('   categories ──self──→ categories (parent/children)');
  console.log('   * All main collections have translations (es/en/fr)');

  console.log('\n🎉 Next steps:');
  console.log('   1. Open http://localhost:8055');
  console.log('   2. Verify all collections in Settings → Data Model');
  console.log('   3. Test translations: create a POI with es/en/fr content');
  console.log('   4. Run seed script to import mock data\n');
}

main().catch(error => {
  console.error('\n❌ FATAL ERROR:', error.message);
  if (error.errors) {
    console.error('\nDetails:');
    error.errors.forEach(err => console.error('  -', err.message));
  }
  process.exit(1);
});

import { createDirectus, rest, authentication, createCollection, createField } from '@directus/sdk';
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

async function createCollectionSafe(collectionConfig) {
  const { collection, meta, schema, fields } = collectionConfig;
  
  try {
    console.log(`\n📦 Creating collection: ${collection}`);
    
    await directus.request(createCollection({
      collection,
      meta,
      schema,
      fields: [
        {
          field: 'id',
          type: 'uuid',
          schema: { is_primary_key: true },
          meta: { hidden: true, readonly: true }
        }
      ]
    }));
    
    console.log(`✅ Collection created: ${collection}`);
    
    // Add fields
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

// ============================================
// COLLECTION DEFINITIONS
// ============================================

const COLLECTIONS = [
  // ============================================
  // 1. MUSEUMS
  // ============================================
  {
    collection: 'museums',
    meta: {
      icon: 'museum',
      note: 'Museos y equipamientos culturales (11 total)',
      display_template: '{{name_es}}',
      sort: 1
    },
    schema: { name: 'museums' },
    fields: [
      // Basic
      { field: 'slug', type: 'string', schema: { is_unique: true, max_length: 100 }, meta: { interface: 'input', required: true, width: 'half', note: 'URL: /museums/{slug}' } },
      { field: 'museum_code', type: 'string', schema: { is_unique: true, max_length: 20 }, meta: { interface: 'input', width: 'half', note: 'Código interno (ej: MUS-01)' } },
      
      // Multilang - Title
      { field: 'name_es', type: 'string', meta: { interface: 'input', required: true, note: 'Nombre en español' } },
      { field: 'name_en', type: 'string', meta: { interface: 'input', note: 'Name in English' } },
      { field: 'name_fr', type: 'string', meta: { interface: 'input', note: 'Nom en français' } },
      
      // Multilang - Short Description
      { field: 'short_description_es', type: 'string', schema: { max_length: 300 }, meta: { interface: 'input-multiline', note: 'Descripción corta (para cards)' } },
      { field: 'short_description_en', type: 'string', schema: { max_length: 300 }, meta: { interface: 'input-multiline' } },
      { field: 'short_description_fr', type: 'string', schema: { max_length: 300 }, meta: { interface: 'input-multiline' } },
      
      // Multilang - Full Description
      { field: 'description_es', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'description_en', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'description_fr', type: 'text', meta: { interface: 'input-rich-text-html' } },
      
      // Location
      { field: 'address', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'municipality', type: 'string', meta: { interface: 'input', width: 'half', required: true } },
      { field: 'postal_code', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'lat', type: 'float', meta: { interface: 'input', width: 'half', required: true, note: 'Latitud' } },
      { field: 'lng', type: 'float', meta: { interface: 'input', width: 'half', required: true, note: 'Longitud' } },
      
      // Media
      { field: 'cover_image', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file-image', note: 'Imagen principal (1920x1080)' } },
      { field: 'gallery', type: 'alias', meta: { interface: 'files', special: ['files'], note: 'Galería de imágenes adicionales' } },
      
      // Contact
      { field: 'website', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'phone', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'email', type: 'string', meta: { interface: 'input', width: 'half' } },
      
      // Info
      { field: 'museum_type', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
        { value: 'industrial', text: 'Industrial' },
        { value: 'mining', text: 'Minería' },
        { value: 'railway', text: 'Ferrocarril' },
        { value: 'ethnographic', text: 'Etnográfico' }
      ] } } },
      
      { field: 'opening_hours', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: 'Horarios estructurados' } },
      { field: 'pricing', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: 'Precios' } },
      { field: 'accessibility', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: 'Accesibilidad' } },
      
      // SEO
      { field: 'seo_title_es', type: 'string', meta: { interface: 'input', note: 'SEO: Título (60 chars)' } },
      { field: 'seo_title_en', type: 'string', meta: { interface: 'input' } },
      { field: 'seo_title_fr', type: 'string', meta: { interface: 'input' } },
      { field: 'seo_description_es', type: 'string', meta: { interface: 'input-multiline', note: 'SEO: Meta description (160 chars)' } },
      { field: 'seo_description_en', type: 'string', meta: { interface: 'input-multiline' } },
      { field: 'seo_description_fr', type: 'string', meta: { interface: 'input-multiline' } },
      { field: 'seo_keywords', type: 'json', meta: { interface: 'tags', note: 'SEO: Keywords' } },
      
      // Flags
      { field: 'featured', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', width: 'half', note: 'Destacado en home' } },
      { field: 'verified', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', width: 'half', note: 'Info verificada' } },
      
      // Stats
      { field: 'view_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true, note: 'Visitas totales' } },
      { field: 'annual_visitors', type: 'integer', meta: { interface: 'input', note: 'Visitantes anuales (real)' } },
      
      // System
      { field: 'status', type: 'string', schema: { default_value: 'draft' }, meta: { interface: 'select-dropdown', options: { choices: [
        { value: 'draft', text: 'Borrador' },
        { value: 'published', text: 'Publicado' },
        { value: 'archived', text: 'Archivado' }
      ] } } },
      { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', special: ['date-created'], readonly: true } },
      { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', special: ['date-updated'], readonly: true } }
    ]
  },

  // ============================================
  // 2. TOURS 360° (3DVista)
  // ============================================
  {
    collection: 'tours_360',
    meta: {
      icon: 'panorama',
      note: 'Tours virtuales 360° (3DVista) - 11 tours',
      display_template: '{{title_es}}',
      sort: 2
    },
    schema: { name: 'tours_360' },
    fields: [
      // Basic
      { field: 'slug', type: 'string', schema: { is_unique: true }, meta: { interface: 'input', required: true, note: 'URL: /tours/{slug}' } },
      
      // Multilang
      { field: 'title_es', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'title_en', type: 'string', meta: { interface: 'input' } },
      { field: 'title_fr', type: 'string', meta: { interface: 'input' } },
      { field: 'description_es', type: 'text', meta: { interface: 'input-multiline', note: 'Descripción del tour' } },
      { field: 'description_en', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'description_fr', type: 'text', meta: { interface: 'input-multiline' } },
      
      // 3DVista Build
      { field: 'build_zip', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', required: true, note: 'ZIP con build de 3DVista (index.html + assets)' } },
      { field: 'build_path', type: 'string', meta: { interface: 'input', readonly: true, note: 'Auto-generado: /tours-builds/{slug}/' } },
      
      // Preview
      { field: 'thumbnail', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file-image', note: 'Preview image' } },
      { field: 'preview_video', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', note: 'Video teaser (opcional)' } },
      
      // Relations
      { field: 'museum_id', type: 'uuid', schema: { foreign_key_table: 'museums' }, meta: { interface: 'select-dropdown-m2o', display_template: '{{name_es}}', note: 'Museo asociado' } },
      
      // Metadata
      { field: 'total_panoramas', type: 'integer', meta: { interface: 'input', width: 'half', note: 'Número de panoramas' } },
      { field: 'duration_minutes', type: 'integer', meta: { interface: 'input', width: 'half', note: 'Duración estimada' } },
      { field: 'has_audio', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', note: 'Tiene audioguías integradas' } },
      { field: 'vr_compatible', type: 'boolean', schema: { default_value: true }, meta: { interface: 'boolean', note: 'Compatible con gafas VR' } },
      
      // SEO
      { field: 'seo_title_es', type: 'string', meta: { interface: 'input' } },
      { field: 'seo_title_en', type: 'string', meta: { interface: 'input' } },
      { field: 'seo_title_fr', type: 'string', meta: { interface: 'input' } },
      { field: 'seo_description_es', type: 'string', meta: { interface: 'input-multiline' } },
      { field: 'seo_description_en', type: 'string', meta: { interface: 'input-multiline' } },
      { field: 'seo_description_fr', type: 'string', meta: { interface: 'input-multiline' } },
      
      // Stats
      { field: 'view_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true } },
      { field: 'average_duration_seconds', type: 'integer', meta: { interface: 'input', readonly: true, note: 'Duración media real' } },
      
      // System
      { field: 'status', type: 'string', schema: { default_value: 'draft' }, meta: { interface: 'select-dropdown', options: { choices: [
        { value: 'draft', text: 'Borrador' },
        { value: 'published', text: 'Publicado' }
      ] } } },
      { field: 'created_at', type: 'timestamp', meta: { special: ['date-created'], readonly: true } },
      { field: 'updated_at', type: 'timestamp', meta: { special: ['date-updated'], readonly: true } }
    ]
  },

  // ============================================
  // 3. AR SCENES (Needle Engine)
  // ============================================
  {
    collection: 'ar_scenes',
    meta: {
      icon: 'view_in_ar',
      note: 'Experiencias AR (Needle Engine) - 29 scenes',
      display_template: '/ar/{{slug}}',
      sort: 3
    },
    schema: { name: 'ar_scenes' },
    fields: [
      // Basic
      { field: 'slug', type: 'string', schema: { is_unique: true }, meta: { interface: 'input', required: true, note: 'URL: /ar/{slug}' } },
      
      // Multilang
      { field: 'title_es', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'title_en', type: 'string', meta: { interface: 'input' } },
      { field: 'title_fr', type: 'string', meta: { interface: 'input' } },
      { field: 'description_es', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'description_en', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'description_fr', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'instructions_es', type: 'text', meta: { interface: 'input-multiline', note: 'Instrucciones de uso' } },
      { field: 'instructions_en', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'instructions_fr', type: 'text', meta: { interface: 'input-multiline' } },
      
      // Needle Build
      { field: 'build_zip', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', required: true, note: 'ZIP con build de Needle Engine' } },
      { field: 'build_path', type: 'string', meta: { interface: 'input', readonly: true, note: 'Auto-generado' } },
      
      // AR Type
      { field: 'ar_type', type: 'string', schema: { default_value: 'slam' }, meta: { interface: 'select-dropdown', required: true, options: { choices: [
        { value: 'slam', text: 'Surface Detection (SLAM)' },
        { value: 'image-tracking', text: 'Image Tracking (Marker)' },
        { value: 'geo', text: 'Geo-positioned AR' }
      ] } } },
      
      // Geo AR
      { field: 'location_lat', type: 'float', meta: { interface: 'input', width: 'half', note: 'Solo para geo AR' } },
      { field: 'location_lng', type: 'float', meta: { interface: 'input', width: 'half' } },
      { field: 'location_radius_meters', type: 'integer', schema: { default_value: 50 }, meta: { interface: 'input', note: 'Radio de activación' } },
      
      // Image Tracking
      { field: 'tracking_marker', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file-image', note: 'Marcador para imprimir (A4)' } },
      { field: 'marker_size_cm', type: 'integer', meta: { interface: 'input', note: 'Tamaño del marcador impreso' } },
      
      // Media
      { field: 'preview_image', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file-image', required: true, note: 'Hero image' } },
      { field: 'preview_video', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', note: 'Video demo' } },
      
      // Metadata
      { field: 'difficulty', type: 'string', schema: { default_value: 'easy' }, meta: { interface: 'select-dropdown', width: 'half', options: { choices: [
        { value: 'easy', text: 'Fácil' },
        { value: 'moderate', text: 'Moderado' },
        { value: 'advanced', text: 'Avanzado' }
      ] } } },
      { field: 'duration_minutes', type: 'integer', schema: { default_value: 10 }, meta: { interface: 'input', width: 'half' } },
      { field: 'requires_outdoors', type: 'boolean', schema: { default_value: true }, meta: { interface: 'boolean', note: '¿Requiere exterior?' } },
      
      // SEO
      { field: 'seo_title_es', type: 'string', meta: { interface: 'input' } },
      { field: 'seo_description_es', type: 'string', meta: { interface: 'input-multiline' } },
      
      // Stats
      { field: 'launch_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true } },
      { field: 'completion_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true } },
      
      // Flags
      { field: 'featured', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean' } },
      
      // System
      { field: 'status', type: 'string', schema: { default_value: 'draft' }, meta: { interface: 'select-dropdown', options: { choices: [
        { value: 'draft', text: 'Borrador' },
        { value: 'published', text: 'Publicado' }
      ] } } },
      { field: 'created_at', type: 'timestamp', meta: { special: ['date-created'], readonly: true } },
      { field: 'updated_at', type: 'timestamp', meta: { special: ['date-updated'], readonly: true } }
    ]
  },

  // ============================================
  // 4. VR EXPERIENCES
  // ============================================
  {
    collection: 'vr_experiences',
    meta: {
      icon: 'sports_esports',
      note: 'Experiencias VR (APK) - 4 experiences',
      display_template: '{{title_es}}',
      sort: 4
    },
    schema: { name: 'vr_experiences' },
    fields: [
      // Basic
      { field: 'slug', type: 'string', schema: { is_unique: true }, meta: { interface: 'input', required: true } },
      
      // Multilang
      { field: 'title_es', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'title_en', type: 'string', meta: { interface: 'input' } },
      { field: 'title_fr', type: 'string', meta: { interface: 'input' } },
      { field: 'description_es', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'description_en', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'description_fr', type: 'text', meta: { interface: 'input-rich-text-html' } },
      
      // Category
      { field: 'category', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { value: 'mine', text: 'Mina' },
        { value: 'industry', text: 'Industria/Siderurgia' },
        { value: 'railway', text: 'Ferrocarril' },
        { value: 'cave', text: 'Cueva/Arte Rupestre' }
      ] } } },
      
      // Files
      { field: 'apk_file', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', required: true, note: 'APK para Pico 4 Ultra (hasta 500MB)' } },
      { field: 'apk_version', type: 'string', meta: { interface: 'input', note: 'Versión del APK (1.0.0)' } },
      { field: 'apk_size_mb', type: 'float', meta: { interface: 'input', readonly: true, note: 'Tamaño en MB' } },
      
      // Media
      { field: 'thumbnail', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file-image', required: true } },
      { field: 'preview_video', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', note: 'Teaser video' } },
      { field: 'screenshots', type: 'alias', meta: { interface: 'files', special: ['files'], note: 'Screenshots de la experiencia' } },
      
      // Metadata
      { field: 'duration_minutes', type: 'integer', meta: { interface: 'input', note: 'Duración estimada' } },
      { field: 'difficulty', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { value: 'easy', text: 'Fácil' },
        { value: 'moderate', text: 'Moderado' }
      ] } } },
      { field: 'age_rating', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { value: '7+', text: '7+' },
        { value: '12+', text: '12+' },
        { value: '16+', text: '16+' }
      ] } } },
      { field: 'motion_sickness_warning', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean' } },
      
      // Requirements
      { field: 'device_requirements', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: 'Requisitos técnicos' } },
      
      // SEO
      { field: 'seo_title_es', type: 'string', meta: { interface: 'input' } },
      { field: 'seo_description_es', type: 'string', meta: { interface: 'input-multiline' } },
      
      // Stats
      { field: 'download_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true } },
      
      // System
      { field: 'status', type: 'string', schema: { default_value: 'draft' }, meta: { interface: 'select-dropdown', options: { choices: [
        { value: 'draft', text: 'Borrador' },
        { value: 'published', text: 'Publicado' }
      ] } } },
      { field: 'created_at', type: 'timestamp', meta: { special: ['date-created'], readonly: true } },
      { field: 'updated_at', type: 'timestamp', meta: { special: ['date-updated'], readonly: true } }
    ]
  },

  // ============================================
  // 5. ROUTES (Immersive Routes)
  // ============================================
  {
    collection: 'routes',
    meta: {
      icon: 'route',
      note: 'Rutas turísticas inmersivas - 29 routes',
      display_template: '{{route_code}} - {{title_es}}',
      sort: 5
    },
    schema: { name: 'routes' },
    fields: [
      // Basic
      { field: 'route_code', type: 'string', schema: { is_unique: true, max_length: 20 }, meta: { interface: 'input', required: true, width: 'half', note: 'Código: AR-1, AR-2, etc.' } },
      { field: 'slug', type: 'string', schema: { is_unique: true }, meta: { interface: 'input', required: true, width: 'half' } },
      
      // Multilang
      { field: 'title_es', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'title_en', type: 'string', meta: { interface: 'input' } },
      { field: 'title_fr', type: 'string', meta: { interface: 'input' } },
      { field: 'short_description_es', type: 'string', schema: { max_length: 300 }, meta: { interface: 'input-multiline' } },
      { field: 'short_description_en', type: 'string', schema: { max_length: 300 }, meta: { interface: 'input-multiline' } },
      { field: 'short_description_fr', type: 'string', schema: { max_length: 300 }, meta: { interface: 'input-multiline' } },
      { field: 'description_es', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'description_en', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'description_fr', type: 'text', meta: { interface: 'input-rich-text-html' } },
      
      // Media
      { field: 'cover_image', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file-image', required: true } },
      { field: 'gallery', type: 'alias', meta: { interface: 'files', special: ['files'] } },
      
      // Route Data
      { field: 'distance_km', type: 'float', meta: { interface: 'input', width: 'half', note: 'Distancia total' } },
      { field: 'duration_hours', type: 'float', meta: { interface: 'input', width: 'half', note: 'Duración estimada' } },
      { field: 'difficulty', type: 'string', schema: { default_value: 'moderate' }, meta: { interface: 'select-dropdown', options: { choices: [
        { value: 'easy', text: 'Fácil' },
        { value: 'moderate', text: 'Moderado' },
        { value: 'hard', text: 'Difícil' }
      ] } } },
      { field: 'elevation_gain_meters', type: 'integer', meta: { interface: 'input', width: 'half' } },
      { field: 'is_circular', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', width: 'half' } },
      
      // Location
      { field: 'center_lat', type: 'float', meta: { interface: 'input', width: 'half', note: 'Centro del mapa' } },
      { field: 'center_lng', type: 'float', meta: { interface: 'input', width: 'half' } },
      
      // GPX
      { field: 'gpx_file', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', note: 'GPX track (CRÍTICO para Vías Verdes)' } },
      { field: 'polyline', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: 'Array de coordenadas' } },
      
      // Metadata
      { field: 'theme_es', type: 'string', meta: { interface: 'input', note: 'Tema/categoría' } },
      { field: 'surface_type', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { value: 'paved', text: 'Asfaltado' },
        { value: 'gravel', text: 'Grava' },
        { value: 'dirt', text: 'Tierra' },
        { value: 'mixed', text: 'Mixto' }
      ] } } },
      
      // SEO
      { field: 'seo_title_es', type: 'string', meta: { interface: 'input' } },
      { field: 'seo_description_es', type: 'string', meta: { interface: 'input-multiline' } },
      
      // Stats
      { field: 'view_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true } },
      { field: 'completion_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true } },
      
      // Flags
      { field: 'featured', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean' } },
      
      // System
      { field: 'status', type: 'string', schema: { default_value: 'draft' }, meta: { interface: 'select-dropdown', options: { choices: [
        { value: 'draft', text: 'Borrador' },
        { value: 'published', text: 'Publicado' }
      ] } } },
      { field: 'created_at', type: 'timestamp', meta: { special: ['date-created'], readonly: true } },
      { field: 'updated_at', type: 'timestamp', meta: { special: ['date-updated'], readonly: true } }
    ]
  },

  // ============================================
  // 6. POIs (Points of Interest)
  // ============================================
  {
    collection: 'pois',
    meta: {
      icon: 'place',
      note: 'Puntos de interés en rutas - 250-300 POIs',
      display_template: '{{title_es}}',
      sort: 6
    },
    schema: { name: 'pois' },
    fields: [
      // Relations
      { field: 'route_id', type: 'uuid', schema: { foreign_key_table: 'routes' }, meta: { interface: 'select-dropdown-m2o', display_template: '{{route_code}} - {{title_es}}', note: 'Ruta asociada' } },
      { field: 'order', type: 'integer', meta: { interface: 'input', note: 'Orden en la ruta (1, 2, 3...)' } },
      
      // Multilang
      { field: 'title_es', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'title_en', type: 'string', meta: { interface: 'input' } },
      { field: 'title_fr', type: 'string', meta: { interface: 'input' } },
      { field: 'description_es', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'description_en', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'description_fr', type: 'text', meta: { interface: 'input-rich-text-html' } },
      
      // Location
      { field: 'lat', type: 'float', meta: { interface: 'input', width: 'half', required: true } },
      { field: 'lng', type: 'float', meta: { interface: 'input', width: 'half', required: true } },
      { field: 'address', type: 'string', meta: { interface: 'input' } },
      
      // Media
      { field: 'cover_image', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file-image' } },
      { field: 'gallery', type: 'alias', meta: { interface: 'files', special: ['files'] } },
      
      // Audioguías (CRÍTICO!)
      { field: 'audio_es', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', note: 'MP3 español (OBLIGATORIO)' } },
      { field: 'audio_en', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', note: 'MP3 inglés' } },
      { field: 'audio_fr', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file', note: 'MP3 francés' } },
      { field: 'audio_duration_seconds', type: 'integer', meta: { interface: 'input', readonly: true, note: 'Duración auto-detectada' } },
      
      // Related Content
      { field: 'ar_scene_id', type: 'uuid', schema: { foreign_key_table: 'ar_scenes' }, meta: { interface: 'select-dropdown-m2o', display_template: '{{slug}}', note: 'AR scene en este POI' } },
      { field: 'tour_360_id', type: 'uuid', schema: { foreign_key_table: 'tours_360' }, meta: { interface: 'select-dropdown-m2o', display_template: '{{slug}}', note: 'Tour 360° en este POI' } },
      { field: 'museum_id', type: 'uuid', schema: { foreign_key_table: 'museums' }, meta: { interface: 'select-dropdown-m2o', display_template: '{{name_es}}', note: 'Si el POI es un museo' } },
      
      // Additional Info
      { field: 'poi_type', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { value: 'museum', text: 'Museo' },
        { value: 'viewpoint', text: 'Mirador' },
        { value: 'monument', text: 'Monumento' },
        { value: 'natural', text: 'Natural' },
        { value: 'industrial', text: 'Industrial' },
        { value: 'restaurant', text: 'Restaurante' },
        { value: 'parking', text: 'Aparcamiento' }
      ] } } },
      { field: 'estimated_time_minutes', type: 'integer', meta: { interface: 'input', note: 'Tiempo en este punto' } },
      { field: 'is_required', type: 'boolean', schema: { default_value: true }, meta: { interface: 'boolean', note: '¿Punto obligatorio?' } },
      
      // Contact
      { field: 'phone', type: 'string', meta: { interface: 'input' } },
      { field: 'website', type: 'string', meta: { interface: 'input' } },
      
      // System
      { field: 'status', type: 'string', schema: { default_value: 'draft' }, meta: { interface: 'select-dropdown', options: { choices: [
        { value: 'draft', text: 'Borrador' },
        { value: 'published', text: 'Publicado' }
      ] } } },
      { field: 'created_at', type: 'timestamp', meta: { special: ['date-created'], readonly: true } },
      { field: 'updated_at', type: 'timestamp', meta: { special: ['date-updated'], readonly: true } }
    ]
  },

  // ============================================
  // 7. ANALYTICS EVENTS
  // ============================================
  {
    collection: 'analytics_events',
    meta: {
      icon: 'analytics',
      note: 'Eventos de usuarios para reportes',
      display_template: '{{event_type}} - {{created_at}}',
      sort: 7,
      archive_field: null,
      singleton: false
    },
    schema: { name: 'analytics_events' },
    fields: [
      // Event
      { field: 'event_type', type: 'string', meta: { interface: 'select-dropdown', required: true, options: { choices: [
        { value: 'page_view', text: 'Vista de página' },
        { value: 'museum_viewed', text: 'Museo visto' },
        { value: 'tour_360_started', text: 'Tour 360° iniciado' },
        { value: 'tour_360_viewed', text: 'Tour 360° completado' },
        { value: 'ar_launched', text: 'AR lanzado' },
        { value: 'ar_completed', text: 'AR completado' },
        { value: 'vr_downloaded', text: 'VR descargado' },
        { value: 'audio_played', text: 'Audio reproducido' },
        { value: 'gpx_downloaded', text: 'GPX descargado' },
        { value: 'route_started', text: 'Ruta iniciada' },
        { value: 'poi_visited', text: 'POI visitado' }
      ] } } },
      
      // Resource
      { field: 'resource_type', type: 'string', meta: { interface: 'input', note: 'museums | tours_360 | ar_scenes | routes | pois' } },
      { field: 'resource_id', type: 'string', meta: { interface: 'input' } },
      
      // Session
      { field: 'session_id', type: 'string', meta: { interface: 'input', note: 'UUID de sesión' } },
      
      // Device
      { field: 'device_type', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { value: 'mobile', text: 'Móvil' },
        { value: 'tablet', text: 'Tablet' },
        { value: 'desktop', text: 'Desktop' },
        { value: 'vr', text: 'VR Headset' }
      ] } } },
      { field: 'user_agent', type: 'string', meta: { interface: 'input', readonly: true } },
      
      // Language
      { field: 'language', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { value: 'es', text: 'Español' },
        { value: 'en', text: 'English' },
        { value: 'fr', text: 'Français' }
      ] } } },
      
      // Metrics
      { field: 'duration_seconds', type: 'integer', meta: { interface: 'input', note: 'Duración del evento' } },
      { field: 'completion_percentage', type: 'integer', meta: { interface: 'input', note: 'Porcentaje completado (0-100)' } },
      
      // Location (anonymous)
      { field: 'municipality', type: 'string', meta: { interface: 'input', note: 'Solo municipio (sin geolocation exacta)' } },
      
      // Timestamp
      { field: 'created_at', type: 'timestamp', meta: { special: ['date-created'], readonly: true, required: true } }
    ]
  },

  // ============================================
  // 8. CATEGORIES
  // ============================================
  {
    collection: 'categories',
    meta: {
      icon: 'category',
      note: 'Categorías de contenido',
      display_template: '{{name_es}}',
      sort: 8
    },
    schema: { name: 'categories' },
    fields: [
      // Basic
      { field: 'slug', type: 'string', schema: { is_unique: true }, meta: { interface: 'input', required: true } },
      
      // Multilang
      { field: 'name_es', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'name_en', type: 'string', meta: { interface: 'input' } },
      { field: 'name_fr', type: 'string', meta: { interface: 'input' } },
      { field: 'description_es', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'description_en', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'description_fr', type: 'text', meta: { interface: 'input-multiline' } },
      
      // Visual
      { field: 'icon', type: 'string', meta: { interface: 'input', note: 'Material Icon name' } },
      { field: 'color', type: 'string', meta: { interface: 'select-color' } },
      
      // Hierarchy
      { field: 'parent_id', type: 'uuid', schema: { foreign_key_table: 'categories' }, meta: { interface: 'select-dropdown-m2o', display_template: '{{name_es}}', note: 'Categoría padre' } },
      { field: 'order', type: 'integer', meta: { interface: 'input', note: 'Orden de visualización' } },
      
      // System
      { field: 'status', type: 'string', schema: { default_value: 'published' }, meta: { interface: 'select-dropdown', options: { choices: [
        { value: 'draft', text: 'Borrador' },
        { value: 'published', text: 'Publicado' }
      ] } } }
    ]
  }
];

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  ASTURIAS XR - DIRECTUS SETUP          ║');
  console.log('║  Complete Database Creation            ║');
  console.log('╚════════════════════════════════════════╝\n');

  await login();

  console.log(`📊 Creating ${COLLECTIONS.length} collections...\n`);

  for (const collectionConfig of COLLECTIONS) {
    await createCollectionSafe(collectionConfig);
  }

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  ✅ DATABASE SETUP COMPLETE!           ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  console.log('📋 Collections created:');
  COLLECTIONS.forEach((col, i) => {
    console.log(`   ${i + 1}. ${col.collection} (${col.fields?.length || 0} fields)`);
  });
  
  console.log('\n🎉 Next steps:');
  console.log('   1. Open http://localhost:8055');
  console.log('   2. Login with admin@asturiasxr.com / AdminSecure2026!');
  console.log('   3. Go to Content → See all collections');
  console.log('   4. Create folders in File Library:');
  console.log('      - tours-360/');
  console.log('      - ar-scenes/');
  console.log('      - vr-experiences/');
  console.log('      - audio/');
  console.log('      - images/');
  console.log('   5. Start uploading content!\n');
}

main().catch(error => {
  console.error('\n❌ FATAL ERROR:', error.message);
  if (error.errors) {
    console.error('\nDetails:');
    error.errors.forEach(err => console.error('  -', err.message));
  }
  process.exit(1);
});

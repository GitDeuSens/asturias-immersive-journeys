/**
 * Add Dynamic Scene fields to AR Scenes collection
 * Allows uploading GLB models + audio directly instead of requiring a full build ZIP
 * 
 * Usage: node add-ar-dynamic-fields.js
 */

const DIRECTUS_URL = 'http://192.168.12.71:8055';
const ADMIN_EMAIL = 'admin@asturiasxr.com';
const ADMIN_PASSWORD = '6xkMbCgPA636ZNCc';
const COLLECTION = 'ar_scenes';

async function getToken() {
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.data.access_token;
}

async function createField(token, fieldDef) {
  const res = await fetch(`${DIRECTUS_URL}/fields/${COLLECTION}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fieldDef),
  });

  if (!res.ok) {
    const err = await res.text();
    // Skip if field already exists
    if (res.status === 400 && err.includes('already exists')) {
      console.log(`  ⏭️  Field "${fieldDef.field}" already exists, skipping`);
      return null;
    }
    throw new Error(`Failed to create field "${fieldDef.field}": ${res.status} ${err}`);
  }

  const json = await res.json();
  console.log(`  ✅ Created field "${fieldDef.field}"`);
  return json.data;
}

// ============================================================
// Field definitions
// ============================================================

const DIVIDER_DYNAMIC = {
  field: 'divider_dynamic_scene',
  type: 'alias',
  meta: {
    interface: 'presentation-divider',
    special: ['alias', 'no-data'],
    options: {
      title: '🎮 Dynamic Scene Configuration',
      icon: 'view_in_ar',
    },
    width: 'full',
    sort: 30,
    note: 'Configure dynamic scenes with GLB models and audio guides',
  },
};

const SCENE_MODE = {
  field: 'scene_mode',
  type: 'string',
  schema: {
    default_value: 'build',
  },
  meta: {
    interface: 'select-dropdown',
    display: 'labels',
    display_options: {
      choices: [
        { value: 'build', text: 'Full Build (ZIP)', foreground: '#FFFFFF', background: '#6644FF' },
        { value: 'dynamic', text: 'Dynamic Scene', foreground: '#FFFFFF', background: '#2ECDA7' },
      ],
    },
    options: {
      choices: [
        { value: 'build', text: 'Full Build (ZIP)' },
        { value: 'dynamic', text: 'Dynamic Scene (GLB + Audio)' },
      ],
    },
    width: 'half',
    sort: 31,
    note: 'Build = custom Needle Engine build, Dynamic = shared viewer with uploaded assets',
  },
};

const GLB_MODEL = {
  field: 'glb_model',
  type: 'uuid',
  schema: {
    foreign_key_table: 'directus_files',
  },
  meta: {
    interface: 'file',
    special: ['file'],
    width: 'full',
    sort: 32,
    note: '3D Model file (.glb / .gltf) — only used in Dynamic mode',
    conditions: [
      {
        name: 'Show when dynamic',
        rule: { _and: [{ scene_mode: { _eq: 'dynamic' } }] },
        hidden: false,
        required: true,
      },
      {
        name: 'Hide when build',
        rule: { _and: [{ scene_mode: { _neq: 'dynamic' } }] },
        hidden: true,
      },
    ],
  },
};

const GLB_SCALE = {
  field: 'glb_scale',
  type: 'float',
  schema: {
    default_value: 1.0,
  },
  meta: {
    interface: 'input',
    width: 'half',
    sort: 33,
    note: 'Model scale factor (1.0 = original size)',
    options: {
      min: 0.01,
      max: 100,
      step: 0.1,
    },
    conditions: [
      {
        name: 'Show when dynamic',
        rule: { _and: [{ scene_mode: { _eq: 'dynamic' } }] },
        hidden: false,
      },
      {
        name: 'Hide when build',
        rule: { _and: [{ scene_mode: { _neq: 'dynamic' } }] },
        hidden: true,
      },
    ],
  },
};

const GLB_ROTATION_Y = {
  field: 'glb_rotation_y',
  type: 'float',
  schema: {
    default_value: 0,
  },
  meta: {
    interface: 'input',
    width: 'half',
    sort: 34,
    note: 'Initial Y-axis rotation in degrees (0–360)',
    options: {
      min: 0,
      max: 360,
      step: 1,
    },
    conditions: [
      {
        name: 'Show when dynamic',
        rule: { _and: [{ scene_mode: { _eq: 'dynamic' } }] },
        hidden: false,
      },
      {
        name: 'Hide when build',
        rule: { _and: [{ scene_mode: { _neq: 'dynamic' } }] },
        hidden: true,
      },
    ],
  },
};

const DIVIDER_AUDIO = {
  field: 'divider_audio_guides',
  type: 'alias',
  meta: {
    interface: 'presentation-divider',
    special: ['alias', 'no-data'],
    options: {
      title: '🔊 Audio Guides',
      icon: 'headphones',
    },
    width: 'full',
    sort: 40,
    note: 'Multilingual audio narration for this AR scene',
  },
};

const AUDIO_ES = {
  field: 'audio_es',
  type: 'uuid',
  schema: {
    foreign_key_table: 'directus_files',
  },
  meta: {
    interface: 'file',
    special: ['file'],
    width: 'half',
    sort: 41,
    note: '🇪🇸 Audio guide — Spanish',
  },
};

const AUDIO_EN = {
  field: 'audio_en',
  type: 'uuid',
  schema: {
    foreign_key_table: 'directus_files',
  },
  meta: {
    interface: 'file',
    special: ['file'],
    width: 'half',
    sort: 42,
    note: '🇬🇧 Audio guide — English',
  },
};

const AUDIO_FR = {
  field: 'audio_fr',
  type: 'uuid',
  schema: {
    foreign_key_table: 'directus_files',
  },
  meta: {
    interface: 'file',
    special: ['file'],
    width: 'half',
    sort: 43,
    note: '🇫🇷 Audio guide — French',
  },
};

const DIVIDER_POPUP = {
  field: 'divider_popup_text',
  type: 'alias',
  meta: {
    interface: 'presentation-divider',
    special: ['alias', 'no-data'],
    options: {
      title: '💬 Popup Text',
      icon: 'chat_bubble',
    },
    width: 'full',
    sort: 50,
    note: 'Text displayed alongside the audio narration',
  },
};

const POPUP_TEXT_ES = {
  field: 'popup_text_es',
  type: 'text',
  schema: {},
  meta: {
    interface: 'input-multiline',
    width: 'half',
    sort: 51,
    note: '🇪🇸 Popup text — Spanish',
  },
};

const POPUP_TEXT_EN = {
  field: 'popup_text_en',
  type: 'text',
  schema: {},
  meta: {
    interface: 'input-multiline',
    width: 'half',
    sort: 52,
    note: '🇬🇧 Popup text — English',
  },
};

const POPUP_TEXT_FR = {
  field: 'popup_text_fr',
  type: 'text',
  schema: {},
  meta: {
    interface: 'input-multiline',
    width: 'full',
    sort: 53,
    note: '🇫🇷 Popup text — French',
  },
};

// ============================================================
// Main
// ============================================================

const ALL_FIELDS = [
  DIVIDER_DYNAMIC,
  SCENE_MODE,
  GLB_MODEL,
  GLB_SCALE,
  GLB_ROTATION_Y,
  DIVIDER_AUDIO,
  AUDIO_ES,
  AUDIO_EN,
  AUDIO_FR,
  DIVIDER_POPUP,
  POPUP_TEXT_ES,
  POPUP_TEXT_EN,
  POPUP_TEXT_FR,
];

async function main() {
  console.log('🚀 Adding Dynamic Scene fields to ar_scenes collection\n');

  const token = await getToken();
  console.log('🔑 Authenticated successfully\n');

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const fieldDef of ALL_FIELDS) {
    try {
      const result = await createField(token, fieldDef);
      if (result) created++;
      else skipped++;
    } catch (err) {
      console.error(`  ❌ ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Created: ${created}  ⏭️ Skipped: ${skipped}  ❌ Failed: ${failed}`);
  console.log(`${'='.repeat(50)}\n`);

  if (failed === 0) {
    console.log('🎉 All done! Open Directus and check the AR Scenes collection.');
    console.log('   Fields are grouped under visual dividers:');
    console.log('   • 🎮 Dynamic Scene Configuration (scene_mode, glb_model, glb_scale, glb_rotation_y)');
    console.log('   • 🔊 Audio Guides (audio_es, audio_en, audio_fr)');
    console.log('   • 💬 Popup Text (popup_text_es, popup_text_en, popup_text_fr)');
  }
}

main().catch(err => {
  console.error('💥 Fatal error:', err.message);
  process.exit(1);
});

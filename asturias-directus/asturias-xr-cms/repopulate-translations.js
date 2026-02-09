#!/usr/bin/env node
// Repopulate translations with correct relations

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

async function repopulate() {
  console.log('🔄 Repopulating translations...');
  
  // Clear junction table
  console.log('  🗑️  Clearing junction table...');
  const clearRes = await api('POST', '/items/ui_translations_translations', {
    query: {
      delete: 'all'
    }
  });
  
  // Clear main collection
  console.log('  🗑️  Clearing main collection...');
  const clearMainRes = await api('POST', '/items/ui_translations', {
    query: {
      delete: 'all'
    }
  });
  
  // Load translations from i18n
  const translations = {
    "common.error": { es: "Error", en: "Error", fr: "Erreur", group: "common" },
    "common.close": { es: "Cerrar", en: "Close", fr: "Fermer", group: "common" },
    "common.loading": { es: "Cargando...", en: "Loading...", fr: "Chargement...", group: "common" },
    "common.save": { es: "Guardar", en: "Save", fr: "Enregistrer", group: "common" },
    "common.cancel": { es: "Cancelar", en: "Cancel", fr: "Annuler", group: "common" },
    "common.confirm": { es: "Confirmar", en: "Confirm", fr: "Confirmer", group: "common" },
    "common.delete": { es: "Eliminar", en: "Delete", fr: "Supprimer", group: "common" },
    "common.edit": { es: "Editar", en: "Edit", fr: "Modifier", group: "common" },
    "common.add": { es: "Añadir", en: "Add", fr: "Ajouter", group: "common" },
    "common.search": { es: "Buscar", en: "Search", fr: "Rechercher", group: "common" },
    "common.filter": { es: "Filtrar", en: "Filter", fr: "Filtrer", group: "common" },
    "common.sort": { es: "Ordenar", en: "Sort", fr: "Trier", group: "common" },
    "common.back": { es: "Volver", en: "Back", fr: "Retour", group: "common" },
    "common.next": { es: "Siguiente", en: "Next", fr: "Suivant", group: "common" },
    "common.previous": { es: "Anterior", en: "Previous", fr: "Précédent", group: "common" },
    "common.first": { es: "Primero", en: "First", fr: "Premier", group: "common" },
    "common.last": { es: "Último", en: "Last", fr: "Dernier", group: "common" },
    "common.view": { es: "Ver", en: "View", fr: "Voir", group: "common" },
    "common.download": { es: "Descargar", en: "Download", fr: "Télécharger", group: "common" },
    "common.upload": { es: "Subir", en: "Upload", fr: "Téléverser", group: "common" },
  };
  
  console.log(`  📝 Creating ${Object.keys(translations).length} translations...`);
  
  let created = 0;
  let errors = 0;
  
  for (const [key, t] of Object.entries(translations)) {
    const res = await api('POST', '/items/ui_translations', {
      key,
      group: t.group,
      status: 'published',
      translations: {
        create: [
          { languages_code: 'es', name: t.es },
          { languages_code: 'en', name: t.en },
          { languages_code: 'fr', name: t.fr },
        ],
        update: [],
        delete: [],
      },
    });
    
    if (res.status === 200) {
      created++;
      console.log(`  ✅ ${key}`);
    } else {
      errors++;
      console.log(`  ❌ ${key}:`, res.data);
    }
  }
  
  console.log(`\n  ✅ Created: ${created}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log('\n🎉 Done! Test the translations interface now.');
}

repopulate().catch(console.error);

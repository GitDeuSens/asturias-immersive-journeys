#!/usr/bin/env node
// ============================================================
// Fix UI translations junction records + Add analytics fields
// + Create Insights dashboards
// ============================================================

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

// ============================================================
// PART 1: Fix UI translations junction records
// ============================================================
async function fixTranslations() {
  console.log('\n========================================');
  console.log('PART 1: Fixing UI translations junctions');
  console.log('========================================\n');

  // Get all parent records sorted by id
  const parentsRes = await api('GET', '/items/ui_translations?limit=-1&sort=id&fields=id,key');
  if (parentsRes.status !== 200) {
    console.error('Failed to get ui_translations:', parentsRes.data);
    return;
  }
  const parents = parentsRes.data.data;
  console.log(`Found ${parents.length} parent ui_translations`);

  // Get all junction records sorted by id
  const junctionsRes = await api('GET', '/items/ui_translations_translations?limit=-1&sort=id');
  if (junctionsRes.status !== 200) {
    console.error('Failed to get junction records:', junctionsRes.data);
    return;
  }
  const junctions = junctionsRes.data.data;
  console.log(`Found ${junctions.length} junction records`);

  // Count orphaned
  const orphaned = junctions.filter(j => !j.ui_translations_id);
  console.log(`Orphaned (null parent): ${orphaned.length}`);

  if (orphaned.length === 0) {
    console.log('No orphaned records to fix!');
    return;
  }

  // Strategy: The bundled translations in index.ts have keys in a specific order.
  // The junction records were created in groups of 3 (es, en, fr) per key.
  // We know parents are sorted by id, and junctions are sorted by id.
  // Each parent should have exactly 3 junction records (es, en, fr).
  
  // Build a map: for each parent key, find its expected translations from the bundled data
  // But simpler: just assign junction records in groups of 3 to parents in order
  
  // First, let's see which junctions already have a parent
  const assignedJunctions = junctions.filter(j => j.ui_translations_id);
  const unassignedJunctions = junctions.filter(j => !j.ui_translations_id);
  
  console.log(`Already assigned: ${assignedJunctions.length}`);
  console.log(`Unassigned: ${unassignedJunctions.length}`);

  // Build set of parent IDs that already have junctions
  const parentsWithJunctions = new Set();
  for (const j of assignedJunctions) {
    parentsWithJunctions.add(j.ui_translations_id);
  }

  // Parents without junctions
  const parentsWithoutJunctions = parents.filter(p => !parentsWithJunctions.has(p.id));
  console.log(`Parents without junctions: ${parentsWithoutJunctions.length}`);

  // Group unassigned junctions by groups of 3 (es, en, fr)
  // Verify the pattern: check first few
  console.log('\nSample unassigned junctions:');
  for (let i = 0; i < Math.min(9, unassignedJunctions.length); i++) {
    const j = unassignedJunctions[i];
    console.log(`  id=${j.id} lang=${j.languages_code} name="${j.name?.substring(0, 40)}"`);
  }

  // Assign in groups of 3 to parents without junctions
  const LANGS = ['es', 'en', 'fr'];
  let assignedCount = 0;
  let errorCount = 0;
  let parentIdx = 0;
  let junctionIdx = 0;

  while (parentIdx < parentsWithoutJunctions.length && junctionIdx < unassignedJunctions.length) {
    const parent = parentsWithoutJunctions[parentIdx];
    const group = [];
    
    // Collect next 3 junctions (es, en, fr)
    for (let langIdx = 0; langIdx < 3 && junctionIdx < unassignedJunctions.length; langIdx++) {
      group.push(unassignedJunctions[junctionIdx]);
      junctionIdx++;
    }

    // Assign all junctions in this group to this parent
    for (const junction of group) {
      const res = await api('PATCH', `/items/ui_translations_translations/${junction.id}`, {
        ui_translations_id: parent.id,
      });
      if (res.status === 200) {
        assignedCount++;
      } else {
        errorCount++;
        console.log(`  ERROR assigning junction ${junction.id} to parent ${parent.id} (key=${parent.key}):`, res.data);
      }
    }
    
    parentIdx++;
  }

  console.log(`\nAssigned: ${assignedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Remaining unassigned junctions: ${unassignedJunctions.length - junctionIdx}`);

  // Verify
  const verifyRes = await api('GET', '/items/ui_translations?limit=3&fields=id,key,translations.languages_code,translations.name&filter[status][_eq]=published');
  if (verifyRes.status === 200) {
    console.log('\nVerification - first 3 translations:');
    for (const item of verifyRes.data.data) {
      const langs = (item.translations || []).map(t => `${t.languages_code}="${t.name?.substring(0, 20)}"`).join(', ');
      console.log(`  ${item.key}: ${langs || '(empty)'}`);
    }
  }
}

// ============================================================
// PART 2: Add new fields to analytics_events collection
// ============================================================
async function addAnalyticsFields() {
  console.log('\n========================================');
  console.log('PART 2: Adding analytics fields');
  console.log('========================================\n');

  const newFields = [
    {
      field: 'experience_type',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        display: 'labels',
        note: 'Type of experience: ar, vr, tour360, route, poi, page',
        options: {
          choices: [
            { text: 'AR', value: 'ar' },
            { text: 'VR', value: 'vr' },
            { text: 'Tour 360°', value: 'tour360' },
            { text: 'Route', value: 'route' },
            { text: 'POI', value: 'poi' },
            { text: 'Page', value: 'page' },
          ],
        },
      },
      schema: { data_type: 'varchar', max_length: 50, is_nullable: true },
    },
    {
      field: 'access_location',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        display: 'labels',
        note: 'Whether user accessed from home or on-location',
        options: {
          choices: [
            { text: 'Home', value: 'home' },
            { text: 'On Location', value: 'on_location' },
            { text: 'Unknown', value: 'unknown' },
          ],
        },
      },
      schema: { data_type: 'varchar', max_length: 50, is_nullable: true },
    },
    {
      field: 'page_url',
      type: 'string',
      meta: {
        interface: 'input',
        note: 'Full page URL where event occurred',
      },
      schema: { data_type: 'varchar', max_length: 500, is_nullable: true },
    },
    {
      field: 'referrer',
      type: 'string',
      meta: {
        interface: 'input',
        note: 'Referrer URL',
      },
      schema: { data_type: 'varchar', max_length: 500, is_nullable: true },
    },
    {
      field: 'screen_resolution',
      type: 'string',
      meta: {
        interface: 'input',
        note: 'Screen resolution (e.g. 1920x1080)',
      },
      schema: { data_type: 'varchar', max_length: 20, is_nullable: true },
    },
    {
      field: 'browser',
      type: 'string',
      meta: {
        interface: 'input',
        note: 'Browser name and version',
      },
      schema: { data_type: 'varchar', max_length: 100, is_nullable: true },
    },
    {
      field: 'os',
      type: 'string',
      meta: {
        interface: 'input',
        note: 'Operating system',
      },
      schema: { data_type: 'varchar', max_length: 100, is_nullable: true },
    },
    {
      field: 'country',
      type: 'string',
      meta: {
        interface: 'input',
        note: 'Country (from browser locale)',
      },
      schema: { data_type: 'varchar', max_length: 10, is_nullable: true },
    },
    {
      field: 'is_returning',
      type: 'boolean',
      meta: {
        interface: 'boolean',
        note: 'Whether this is a returning visitor',
      },
      schema: { data_type: 'boolean', is_nullable: true, default_value: false },
    },
  ];

  for (const field of newFields) {
    const res = await api('POST', '/fields/analytics_events', field);
    if (res.status === 200) {
      console.log(`  ✅ Created field: ${field.field}`);
    } else if (res.data?.errors?.[0]?.extensions?.code === 'FIELD_ALREADY_EXISTS' ||
               (typeof res.data === 'string' && res.data.includes('already exists')) ||
               res.status === 400) {
      console.log(`  ⏭️  Field already exists: ${field.field}`);
    } else {
      console.log(`  ❌ Error creating ${field.field}:`, JSON.stringify(res.data).substring(0, 200));
    }
  }
}

// ============================================================
// PART 3: Make analytics_events publicly writable (for tracking)
// ============================================================
async function ensurePublicAccess() {
  console.log('\n========================================');
  console.log('PART 3: Ensuring public write access');
  console.log('========================================\n');

  // Check current public role permissions
  const permRes = await api('GET', '/permissions?filter[collection][_eq]=analytics_events&filter[role][_null]=true');
  if (permRes.status === 200) {
    const perms = permRes.data.data || [];
    const hasCreate = perms.some(p => p.action === 'create');
    if (hasCreate) {
      console.log('  Public CREATE permission already exists');
    } else {
      const createRes = await api('POST', '/permissions', {
        role: null,
        collection: 'analytics_events',
        action: 'create',
        fields: ['*'],
      });
      console.log(createRes.status === 200 ? '  ✅ Added public CREATE permission' : `  ❌ Error: ${JSON.stringify(createRes.data).substring(0, 200)}`);
    }
    
    const hasRead = perms.some(p => p.action === 'read');
    if (hasRead) {
      console.log('  Public READ permission already exists');
    } else {
      const readRes = await api('POST', '/permissions', {
        role: null,
        collection: 'analytics_events',
        action: 'read',
        fields: ['*'],
      });
      console.log(readRes.status === 200 ? '  ✅ Added public READ permission' : `  ❌ Error: ${JSON.stringify(readRes.data).substring(0, 200)}`);
    }
  }
}

// ============================================================
// PART 4: Create Insights dashboards
// ============================================================
async function createInsightsDashboards() {
  console.log('\n========================================');
  console.log('PART 4: Creating Insights dashboards');
  console.log('========================================\n');

  // Check existing dashboards
  const existingRes = await api('GET', '/dashboards');
  const existing = existingRes.data?.data || [];
  const existingNames = existing.map(d => d.name);
  console.log(`Existing dashboards: ${existingNames.join(', ') || 'none'}`);

  // ---- Dashboard 1: Overview ----
  let overviewId = existing.find(d => d.name === 'Analytics Overview')?.id;
  if (!overviewId) {
    const res = await api('POST', '/dashboards', {
      name: 'Analytics Overview',
      icon: 'insights',
      note: 'General analytics overview: total events, sessions, devices, languages',
    });
    overviewId = res.data?.data?.id;
    console.log(overviewId ? `  ✅ Created dashboard: Analytics Overview (${overviewId})` : '  ❌ Failed to create Analytics Overview');
  } else {
    console.log(`  ⏭️  Dashboard exists: Analytics Overview (${overviewId})`);
  }

  if (overviewId) {
    const overviewPanels = [
      {
        dashboard: overviewId, name: 'Total Events', icon: 'bar_chart', color: '#6644FF',
        type: 'metric', position_x: 1, position_y: 1, width: 8, height: 6,
        options: { collection: 'analytics_events', function: 'count', field: 'id', sortField: 'created_at' },
      },
      {
        dashboard: overviewId, name: 'Unique Sessions', icon: 'people', color: '#2ECDA7',
        type: 'metric', position_x: 9, position_y: 1, width: 8, height: 6,
        options: { collection: 'analytics_events', function: 'countDistinct', field: 'session_id', sortField: 'created_at' },
      },
      {
        dashboard: overviewId, name: 'Avg Duration (sec)', icon: 'timer', color: '#FF6B6B',
        type: 'metric', position_x: 17, position_y: 1, width: 8, height: 6,
        options: { collection: 'analytics_events', function: 'avg', field: 'duration_seconds', sortField: 'created_at' },
      },
      {
        dashboard: overviewId, name: 'Events Over Time', icon: 'timeline', color: '#6644FF',
        type: 'time-series', position_x: 1, position_y: 7, width: 24, height: 10,
        options: {
          collection: 'analytics_events', function: 'count', precision: 'day',
          dateField: 'created_at', valueField: 'id', range: '1 month',
          color: '#6644FF', showXAxis: true, showYAxis: true,
        },
      },
      {
        dashboard: overviewId, name: 'Device Distribution', icon: 'devices', color: '#2ECDA7',
        type: 'pie-chart', position_x: 1, position_y: 17, width: 12, height: 10,
        options: {
          collection: 'analytics_events', field: 'device_type', function: 'count',
          donut: true, showLabels: true, showLegend: 'right', color: '#2ECDA7',
        },
      },
      {
        dashboard: overviewId, name: 'Language Distribution', icon: 'translate', color: '#FF9F43',
        type: 'pie-chart', position_x: 13, position_y: 17, width: 12, height: 10,
        options: {
          collection: 'analytics_events', field: 'language', function: 'count',
          donut: true, showLabels: true, showLegend: 'right', color: '#FF9F43',
        },
      },
      {
        dashboard: overviewId, name: 'Recent Events', icon: 'list', color: '#6644FF',
        type: 'list', position_x: 1, position_y: 27, width: 24, height: 10,
        options: {
          collection: 'analytics_events',
          displayTemplate: '{{event_type}} — {{resource_type}} — {{device_type}} — {{created_at}}',
          sortField: 'created_at', sortDirection: 'desc', limit: 20,
        },
      },
    ];

    for (const panel of overviewPanels) {
      const res = await api('POST', '/panels', panel);
      console.log(res.status === 200 ? `    ✅ Panel: ${panel.name}` : `    ❌ Panel ${panel.name}: ${JSON.stringify(res.data).substring(0, 150)}`);
    }
  }

  // ---- Dashboard 2: Experience Types (AR/VR/360) ----
  let expId = existing.find(d => d.name === 'Experience Types')?.id;
  if (!expId) {
    const res = await api('POST', '/dashboards', {
      name: 'Experience Types',
      icon: 'view_in_ar',
      note: 'AR/VR/360° experience analytics: completion rates, type distribution, time spent',
    });
    expId = res.data?.data?.id;
    console.log(expId ? `  ✅ Created dashboard: Experience Types (${expId})` : '  ❌ Failed');
  } else {
    console.log(`  ⏭️  Dashboard exists: Experience Types (${expId})`);
  }

  if (expId) {
    const expPanels = [
      {
        dashboard: expId, name: 'Experience Type Distribution', icon: 'donut_large', color: '#6644FF',
        type: 'pie-chart', position_x: 1, position_y: 1, width: 12, height: 10,
        options: {
          collection: 'analytics_events', field: 'experience_type', function: 'count',
          donut: true, showLabels: true, showLegend: 'right', color: '#6644FF',
        },
      },
      {
        dashboard: expId, name: 'Avg Completion %', icon: 'percent', color: '#2ECDA7',
        type: 'metric', position_x: 13, position_y: 1, width: 6, height: 5,
        options: {
          collection: 'analytics_events', function: 'avg', field: 'completion_percentage',
          sortField: 'created_at', suffix: '%',
        },
      },
      {
        dashboard: expId, name: 'Total AR Events', icon: 'view_in_ar', color: '#FF6B6B',
        type: 'metric', position_x: 19, position_y: 1, width: 6, height: 5,
        options: {
          collection: 'analytics_events', function: 'count', field: 'id',
          sortField: 'created_at',
          filter: { experience_type: { _eq: 'ar' } },
        },
      },
      {
        dashboard: expId, name: 'Total VR Events', icon: 'vrpano', color: '#FF9F43',
        type: 'metric', position_x: 13, position_y: 6, width: 6, height: 5,
        options: {
          collection: 'analytics_events', function: 'count', field: 'id',
          sortField: 'created_at',
          filter: { experience_type: { _eq: 'vr' } },
        },
      },
      {
        dashboard: expId, name: 'Total 360° Events', icon: '360', color: '#54A0FF',
        type: 'metric', position_x: 19, position_y: 6, width: 6, height: 5,
        options: {
          collection: 'analytics_events', function: 'count', field: 'id',
          sortField: 'created_at',
          filter: { experience_type: { _eq: 'tour360' } },
        },
      },
      {
        dashboard: expId, name: 'Experience Events Over Time', icon: 'timeline', color: '#6644FF',
        type: 'time-series', position_x: 1, position_y: 11, width: 24, height: 10,
        options: {
          collection: 'analytics_events', function: 'count', precision: 'day',
          dateField: 'created_at', valueField: 'id', range: '1 month',
          color: '#6644FF', showXAxis: true, showYAxis: true,
          filter: { experience_type: { _nnull: true } },
        },
      },
      {
        dashboard: expId, name: 'Avg Time in Experience (sec)', icon: 'timer', color: '#2ECDA7',
        type: 'metric', position_x: 1, position_y: 21, width: 8, height: 6,
        options: {
          collection: 'analytics_events', function: 'avg', field: 'duration_seconds',
          sortField: 'created_at', suffix: 's',
          filter: { experience_type: { _nnull: true } },
        },
      },
      {
        dashboard: expId, name: 'Access Location Distribution', icon: 'location_on', color: '#FF6B6B',
        type: 'pie-chart', position_x: 9, position_y: 21, width: 16, height: 10,
        options: {
          collection: 'analytics_events', field: 'access_location', function: 'count',
          donut: true, showLabels: true, showLegend: 'right', color: '#FF6B6B',
        },
      },
    ];

    for (const panel of expPanels) {
      const res = await api('POST', '/panels', panel);
      console.log(res.status === 200 ? `    ✅ Panel: ${panel.name}` : `    ❌ Panel ${panel.name}: ${JSON.stringify(res.data).substring(0, 150)}`);
    }
  }

  // ---- Dashboard 3: Routes & POIs ----
  let routesId = existing.find(d => d.name === 'Routes & POIs')?.id;
  if (!routesId) {
    const res = await api('POST', '/dashboards', {
      name: 'Routes & POIs',
      icon: 'route',
      note: 'Popular routes, POI statistics, route completion',
    });
    routesId = res.data?.data?.id;
    console.log(routesId ? `  ✅ Created dashboard: Routes & POIs (${routesId})` : '  ❌ Failed');
  } else {
    console.log(`  ⏭️  Dashboard exists: Routes & POIs (${routesId})`);
  }

  if (routesId) {
    const routesPanels = [
      {
        dashboard: routesId, name: 'Total Route Views', icon: 'route', color: '#6644FF',
        type: 'metric', position_x: 1, position_y: 1, width: 8, height: 6,
        options: {
          collection: 'analytics_events', function: 'count', field: 'id',
          sortField: 'created_at',
          filter: { event_type: { _eq: 'route_viewed' } },
        },
      },
      {
        dashboard: routesId, name: 'Total POI Views', icon: 'place', color: '#2ECDA7',
        type: 'metric', position_x: 9, position_y: 1, width: 8, height: 6,
        options: {
          collection: 'analytics_events', function: 'count', field: 'id',
          sortField: 'created_at',
          filter: { event_type: { _eq: 'poi_viewed' } },
        },
      },
      {
        dashboard: routesId, name: 'GPX Downloads', icon: 'download', color: '#FF9F43',
        type: 'metric', position_x: 17, position_y: 1, width: 8, height: 6,
        options: {
          collection: 'analytics_events', function: 'count', field: 'id',
          sortField: 'created_at',
          filter: { event_type: { _eq: 'gpx_downloaded' } },
        },
      },
      {
        dashboard: routesId, name: 'Route Activity Over Time', icon: 'timeline', color: '#6644FF',
        type: 'time-series', position_x: 1, position_y: 7, width: 24, height: 10,
        options: {
          collection: 'analytics_events', function: 'count', precision: 'day',
          dateField: 'created_at', valueField: 'id', range: '1 month',
          color: '#6644FF', showXAxis: true, showYAxis: true,
          filter: { event_type: { _in: ['route_viewed', 'route_started', 'poi_viewed'] } },
        },
      },
      {
        dashboard: routesId, name: 'Most Viewed Routes', icon: 'leaderboard', color: '#6644FF',
        type: 'list', position_x: 1, position_y: 17, width: 12, height: 10,
        options: {
          collection: 'analytics_events',
          displayTemplate: '{{resource_id}} — {{extra_data}}',
          sortField: 'created_at', sortDirection: 'desc', limit: 20,
          filter: { event_type: { _eq: 'route_viewed' } },
        },
      },
      {
        dashboard: routesId, name: 'Most Viewed POIs', icon: 'place', color: '#2ECDA7',
        type: 'list', position_x: 13, position_y: 17, width: 12, height: 10,
        options: {
          collection: 'analytics_events',
          displayTemplate: '{{resource_id}} — {{extra_data}}',
          sortField: 'created_at', sortDirection: 'desc', limit: 20,
          filter: { event_type: { _eq: 'poi_viewed' } },
        },
      },
    ];

    for (const panel of routesPanels) {
      const res = await api('POST', '/panels', panel);
      console.log(res.status === 200 ? `    ✅ Panel: ${panel.name}` : `    ❌ Panel ${panel.name}: ${JSON.stringify(res.data).substring(0, 150)}`);
    }
  }

  // ---- Dashboard 4: User Behavior ----
  let behaviorId = existing.find(d => d.name === 'User Behavior')?.id;
  if (!behaviorId) {
    const res = await api('POST', '/dashboards', {
      name: 'User Behavior',
      icon: 'psychology',
      note: 'Session duration, returning visitors, browser/OS stats, access patterns',
    });
    behaviorId = res.data?.data?.id;
    console.log(behaviorId ? `  ✅ Created dashboard: User Behavior (${behaviorId})` : '  ❌ Failed');
  } else {
    console.log(`  ⏭️  Dashboard exists: User Behavior (${behaviorId})`);
  }

  if (behaviorId) {
    const behaviorPanels = [
      {
        dashboard: behaviorId, name: 'Avg Session Duration (sec)', icon: 'timer', color: '#6644FF',
        type: 'metric', position_x: 1, position_y: 1, width: 8, height: 6,
        options: {
          collection: 'analytics_events', function: 'avg', field: 'duration_seconds',
          sortField: 'created_at', suffix: 's',
          filter: { event_type: { _eq: 'session_end' } },
        },
      },
      {
        dashboard: behaviorId, name: 'Returning Visitors', icon: 'replay', color: '#2ECDA7',
        type: 'metric', position_x: 9, position_y: 1, width: 8, height: 6,
        options: {
          collection: 'analytics_events', function: 'count', field: 'id',
          sortField: 'created_at',
          filter: { _and: [{ event_type: { _eq: 'session_start' } }, { is_returning: { _eq: true } }] },
        },
      },
      {
        dashboard: behaviorId, name: 'New Visitors', icon: 'person_add', color: '#FF6B6B',
        type: 'metric', position_x: 17, position_y: 1, width: 8, height: 6,
        options: {
          collection: 'analytics_events', function: 'count', field: 'id',
          sortField: 'created_at',
          filter: { _and: [{ event_type: { _eq: 'session_start' } }, { is_returning: { _neq: true } }] },
        },
      },
      {
        dashboard: behaviorId, name: 'Browser Distribution', icon: 'web', color: '#54A0FF',
        type: 'pie-chart', position_x: 1, position_y: 7, width: 12, height: 10,
        options: {
          collection: 'analytics_events', field: 'browser', function: 'count',
          donut: true, showLabels: true, showLegend: 'right', color: '#54A0FF',
          filter: { event_type: { _eq: 'session_start' } },
        },
      },
      {
        dashboard: behaviorId, name: 'OS Distribution', icon: 'computer', color: '#FF9F43',
        type: 'pie-chart', position_x: 13, position_y: 7, width: 12, height: 10,
        options: {
          collection: 'analytics_events', field: 'os', function: 'count',
          donut: true, showLabels: true, showLegend: 'right', color: '#FF9F43',
          filter: { event_type: { _eq: 'session_start' } },
        },
      },
      {
        dashboard: behaviorId, name: 'Screen Resolution', icon: 'aspect_ratio', color: '#6644FF',
        type: 'pie-chart', position_x: 1, position_y: 17, width: 12, height: 10,
        options: {
          collection: 'analytics_events', field: 'screen_resolution', function: 'count',
          donut: true, showLabels: true, showLegend: 'right', color: '#6644FF',
          filter: { event_type: { _eq: 'session_start' } },
        },
      },
      {
        dashboard: behaviorId, name: 'Home vs On-Location Access', icon: 'location_on', color: '#2ECDA7',
        type: 'pie-chart', position_x: 13, position_y: 17, width: 12, height: 10,
        options: {
          collection: 'analytics_events', field: 'access_location', function: 'count',
          donut: true, showLabels: true, showLegend: 'right', color: '#2ECDA7',
          filter: { event_type: { _eq: 'session_start' } },
        },
      },
      {
        dashboard: behaviorId, name: 'Sessions Over Time', icon: 'timeline', color: '#6644FF',
        type: 'time-series', position_x: 1, position_y: 27, width: 24, height: 10,
        options: {
          collection: 'analytics_events', function: 'count', precision: 'day',
          dateField: 'created_at', valueField: 'id', range: '1 month',
          color: '#6644FF', showXAxis: true, showYAxis: true,
          filter: { event_type: { _eq: 'session_start' } },
        },
      },
    ];

    for (const panel of behaviorPanels) {
      const res = await api('POST', '/panels', panel);
      console.log(res.status === 200 ? `    ✅ Panel: ${panel.name}` : `    ❌ Panel ${panel.name}: ${JSON.stringify(res.data).substring(0, 150)}`);
    }
  }

  console.log('\n✅ Dashboards created! Visit: http://localhost:8055/admin/insights');
}

// ============================================================
// RUN ALL
// ============================================================
async function main() {
  console.log('🚀 Starting comprehensive fix...\n');
  
  await fixTranslations();
  await addAnalyticsFields();
  await ensurePublicAccess();
  await createInsightsDashboards();
  
  console.log('\n🎉 All done!');
}

main().catch(console.error);

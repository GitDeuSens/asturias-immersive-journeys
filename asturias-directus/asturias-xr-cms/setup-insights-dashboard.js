#!/usr/bin/env node
// ============================================
// Setup Directus Insights Dashboard for Analytics
// Creates panels in the existing Analytics dashboard
// ============================================

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@asturiasxr.com';
const ADMIN_PASSWORD = '6xkMbCgPA636ZNCc';

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

async function main() {
  console.log('🔐 Authenticating...');
  await getToken();
  console.log('✅ Authenticated\n');

  // 1. Find or create dashboard
  console.log('📊 Looking for Analytics dashboard...');
  const dashRes = await api('GET', '/dashboards');
  let dashboard = dashRes.data.data?.find(d => d.name === 'Analytics');

  if (!dashboard) {
    console.log('  Creating new dashboard...');
    const createRes = await api('POST', '/dashboards', {
      name: 'Analytics',
      icon: 'analytics',
      note: 'Análisis de uso de la aplicación Asturias XR',
    });
    dashboard = createRes.data.data;
    console.log(`  ✅ Created dashboard: ${dashboard.id}`);
  } else {
    console.log(`  ✅ Found existing dashboard: ${dashboard.id}`);
    // Delete existing panels to recreate them
    if (dashboard.panels && dashboard.panels.length > 0) {
      console.log(`  🗑️  Deleting ${dashboard.panels.length} existing panels...`);
      for (const panelId of dashboard.panels) {
        const id = typeof panelId === 'string' ? panelId : panelId.id;
        await api('DELETE', `/panels/${id}`);
      }
      console.log('  ✅ Old panels deleted');
    }
  }

  const DASH_ID = dashboard.id;

  // 2. Create panels
  // Options format verified from Directus 10.10 source code:
  // - metric: { collection, field, function, sortField, filter? }
  // - list: { collection, displayTemplate, sortField, sortDirection, limit, filter? }
  // - time-series: { collection, function, precision, dateField, range, valueField, color, filter? }
  // - bar-chart: { collection, xAxis, yAxis, color, filter? }
  // - pie-chart: { collection, field, function, donut?, showLabels?, showLegend?, color, filter? }
  console.log('\n📋 Creating panels...\n');

  const panels = [
    // ── Row 1: KPI Metrics ──
    {
      dashboard: DASH_ID,
      name: 'Total Eventos',
      icon: 'event',
      color: '#6644FF',
      note: 'Número total de eventos registrados',
      type: 'metric',
      position_x: 1,
      position_y: 1,
      width: 6,
      height: 6,
      options: {
        collection: 'analytics_events',
        function: 'count',
        field: 'id',
        sortField: 'created_at',
        notation: 'standard',
      },
    },
    {
      dashboard: DASH_ID,
      name: 'Sesiones Únicas',
      icon: 'people',
      color: '#2ECDA7',
      note: 'Sesiones únicas por session_id',
      type: 'metric',
      position_x: 7,
      position_y: 1,
      width: 6,
      height: 6,
      options: {
        collection: 'analytics_events',
        function: 'countDistinct',
        field: 'session_id',
        sortField: 'created_at',
        notation: 'standard',
      },
    },
    {
      dashboard: DASH_ID,
      name: 'Vistas de Página',
      icon: 'visibility',
      color: '#3399FF',
      note: 'Eventos de tipo page_view',
      type: 'metric',
      position_x: 13,
      position_y: 1,
      width: 6,
      height: 6,
      options: {
        collection: 'analytics_events',
        function: 'count',
        field: 'id',
        sortField: 'created_at',
        filter: {
          _and: [{ event_type: { _eq: 'page_view' } }],
        },
      },
    },
    {
      dashboard: DASH_ID,
      name: 'Interacciones',
      icon: 'touch_app',
      color: '#FF6633',
      note: 'Tours, AR, rutas y POIs vistos',
      type: 'metric',
      position_x: 19,
      position_y: 1,
      width: 6,
      height: 6,
      options: {
        collection: 'analytics_events',
        function: 'count',
        field: 'id',
        sortField: 'created_at',
        filter: {
          _and: [
            {
              event_type: {
                _in: ['tour_viewed', 'tour_started', 'tour_completed', 'tour_loaded', 'ar_started', 'route_viewed', 'poi_viewed', 'vr_viewed'],
              },
            },
          ],
        },
      },
    },

    // ── Row 2: Time Series (activity over time) ──
    {
      dashboard: DASH_ID,
      name: 'Actividad por Día',
      icon: 'show_chart',
      color: '#6644FF',
      note: 'Eventos registrados por día',
      type: 'time-series',
      position_x: 1,
      position_y: 7,
      width: 24,
      height: 10,
      options: {
        collection: 'analytics_events',
        function: 'count',
        precision: 'day',
        dateField: 'created_at',
        valueField: 'id',
        range: '1 month',
        color: '#6644FF',
        curveType: 'smooth',
        fillType: 'gradient',
        showXAxis: true,
        showYAxis: true,
      },
    },

    // ── Row 3: Pie charts (devices, languages) + list of recent events ──
    {
      dashboard: DASH_ID,
      name: 'Dispositivos',
      icon: 'devices',
      color: '#2ECDA7',
      note: 'Distribución por tipo de dispositivo',
      type: 'pie-chart',
      position_x: 1,
      position_y: 17,
      width: 8,
      height: 10,
      options: {
        collection: 'analytics_events',
        field: 'device_type',
        function: 'count',
        donut: false,
        showLabels: true,
        showLegend: 'bottom',
        color: '#2ECDA7',
      },
    },
    {
      dashboard: DASH_ID,
      name: 'Idiomas',
      icon: 'language',
      color: '#3399FF',
      note: 'Distribución por idioma del usuario',
      type: 'pie-chart',
      position_x: 9,
      position_y: 17,
      width: 8,
      height: 10,
      options: {
        collection: 'analytics_events',
        field: 'language',
        function: 'count',
        donut: true,
        showLabels: true,
        showLegend: 'bottom',
        color: '#3399FF',
      },
    },
    {
      dashboard: DASH_ID,
      name: 'Tipos de Evento',
      icon: 'category',
      color: '#E040FB',
      note: 'Distribución por tipo de evento',
      type: 'pie-chart',
      position_x: 17,
      position_y: 17,
      width: 8,
      height: 10,
      options: {
        collection: 'analytics_events',
        field: 'event_type',
        function: 'count',
        donut: true,
        showLabels: true,
        showLegend: 'bottom',
        color: '#6644FF',
      },
    },

    // ── Row 4: Recent events list + extra metrics ──
    {
      dashboard: DASH_ID,
      name: 'Últimos Eventos',
      icon: 'list',
      color: '#FF6633',
      note: 'Los eventos más recientes',
      type: 'list',
      position_x: 1,
      position_y: 27,
      width: 16,
      height: 10,
      options: {
        collection: 'analytics_events',
        displayTemplate: '{{event_type}} — {{resource_type}} — {{device_type}} — {{language}}',
        sortField: 'created_at',
        sortDirection: 'desc',
        limit: 10,
      },
    },
    {
      dashboard: DASH_ID,
      name: 'Tours Completados',
      icon: 'check_circle',
      color: '#2ECDA7',
      note: 'Tours 360° completados',
      type: 'metric',
      position_x: 17,
      position_y: 27,
      width: 8,
      height: 5,
      options: {
        collection: 'analytics_events',
        function: 'count',
        field: 'id',
        sortField: 'created_at',
        filter: {
          _and: [{ event_type: { _eq: 'tour_completed' } }],
        },
      },
    },
    {
      dashboard: DASH_ID,
      name: 'Tours Iniciados',
      icon: 'play_circle',
      color: '#FFB020',
      note: 'Tours 360° iniciados',
      type: 'metric',
      position_x: 17,
      position_y: 32,
      width: 8,
      height: 5,
      options: {
        collection: 'analytics_events',
        function: 'count',
        field: 'id',
        sortField: 'created_at',
        filter: {
          _and: [{ event_type: { _in: ['tour_started', 'tour_loaded'] } }],
        },
      },
    },
  ];

  for (const panel of panels) {
    const res = await api('POST', '/panels', panel);
    if (res.status === 200 || res.status === 204) {
      console.log(`  ✅ ${panel.name}`);
    } else {
      console.log(`  ❌ ${panel.name}: ${res.status} — ${JSON.stringify(res.data).substring(0, 200)}`);
    }
  }

  console.log(`\n🎉 Dashboard ready! Open: ${DIRECTUS_URL}/admin/insights/${DASH_ID}`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

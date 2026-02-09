import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  MapPin,
  Camera,
  Route as RouteIcon,
  Gamepad2,
  Search,
  Share2,
  ArrowLeft,
  RefreshCw,
  Calendar,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { useAnalyticsEvents } from '@/hooks/useDirectusData';
import { useNavigate } from 'react-router-dom';

// ============ TYPES ============

interface AnalyticsEvent {
  id: string;
  event_type: string;
  resource_type?: string;
  resource_id?: string;
  session_id?: string;
  device_type?: string;
  language?: string;
  duration_seconds?: number;
  completion_percentage?: number;
  extra_data?: Record<string, any>;
  created_at: string;
}

type TimeRange = '24h' | '7d' | '30d' | 'all';

// ============ COLORS ============

const CHART_COLORS = [
  'hsl(142, 76%, 36%)',  // green
  'hsl(221, 83%, 53%)',  // blue
  'hsl(38, 92%, 50%)',   // amber
  'hsl(0, 84%, 60%)',    // red
  'hsl(262, 83%, 58%)',  // purple
  'hsl(173, 80%, 40%)',  // teal
  'hsl(25, 95%, 53%)',   // orange
  'hsl(330, 81%, 60%)',  // pink
];

const DEVICE_COLORS: Record<string, string> = {
  mobile: 'hsl(221, 83%, 53%)',
  tablet: 'hsl(38, 92%, 50%)',
  desktop: 'hsl(142, 76%, 36%)',
};

const DEVICE_ICONS: Record<string, typeof Smartphone> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

// ============ HELPER FUNCTIONS ============

function getSinceDate(range: TimeRange): string | undefined {
  if (range === 'all') return undefined;
  const now = new Date();
  switch (range) {
    case '24h': now.setHours(now.getHours() - 24); break;
    case '7d': now.setDate(now.getDate() - 7); break;
    case '30d': now.setDate(now.getDate() - 30); break;
  }
  return now.toISOString();
}

function groupByField(events: AnalyticsEvent[], field: keyof AnalyticsEvent): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of events) {
    const key = (e[field] as string) || 'unknown';
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function groupByDay(events: AnalyticsEvent[]): { date: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const e of events) {
    const day = e.created_at?.slice(0, 10) || 'unknown';
    counts[day] = (counts[day] || 0) + 1;
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

function getUniqueSessions(events: AnalyticsEvent[]): number {
  return new Set(events.map(e => e.session_id).filter(Boolean)).size;
}

// ============ COMPONENTS ============

function MetricCard({ 
  title, value, subtitle, icon: Icon, color = 'primary', delay = 0 
}: { 
  title: string; value: string | number; subtitle?: string; icon: typeof Eye; color?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl bg-${color}/10`}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>}
    </motion.div>
  );
}

function ChartCard({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
    >
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}

function EventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    page_view: 'Vistas de página',
    tour_viewed: 'Tours 360° vistos',
    tour_started: 'Tours iniciados',
    tour_completed: 'Tours completados',
    ar_started: 'AR iniciadas',
    ar_completed: 'AR completadas',
    ar_error: 'Errores AR',
    route_viewed: 'Rutas vistas',
    route_started: 'Rutas iniciadas',
    poi_viewed: 'POIs vistos',
    search: 'Búsquedas',
    share: 'Compartidos',
    gpx_downloaded: 'GPX descargados',
    audio_played: 'Audio reproducido',
    fullscreen_opened: 'Pantalla completa',
    language_changed: 'Cambio idioma',
    theme_changed: 'Cambio tema',
    vr_viewed: 'VR vistas',
    cookie_consent: 'Consentimiento cookies',
  };
  return labels[type] || type;
}

// ============ MAIN DASHBOARD ============

export function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const since = useMemo(() => getSinceDate(timeRange), [timeRange]);
  const { events: rawEvents, loading, error, reload: loadEvents } = useAnalyticsEvents(since);
  const events = rawEvents as AnalyticsEvent[];

  // ============ COMPUTED DATA ============

  const totalEvents = events.length;
  const uniqueSessions = useMemo(() => getUniqueSessions(events), [events]);
  const pageViews = useMemo(() => events.filter(e => e.event_type === 'page_view').length, [events]);
  
  const contentInteractions = useMemo(() => 
    events.filter(e => ['tour_viewed', 'ar_started', 'route_viewed', 'poi_viewed', 'vr_viewed'].includes(e.event_type)).length
  , [events]);

  // Events by type (for bar chart)
  const eventsByType = useMemo(() => {
    const counts = groupByField(events.filter(e => e.event_type !== 'page_view'), 'event_type');
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([type, count]) => ({ type: EventTypeLabel(type), count }));
  }, [events]);

  // Events by day (for area chart)
  const eventsByDay = useMemo(() => groupByDay(events), [events]);

  // Device breakdown (for pie chart)
  const deviceBreakdown = useMemo(() => {
    const counts = groupByField(events, 'device_type');
    return Object.entries(counts)
      .filter(([key]) => key !== 'unknown')
      .map(([device, count]) => ({ 
        name: device.charAt(0).toUpperCase() + device.slice(1), 
        value: count,
        color: DEVICE_COLORS[device] || CHART_COLORS[0],
      }));
  }, [events]);

  // Language breakdown (for pie chart)
  const languageBreakdown = useMemo(() => {
    const counts = groupByField(events, 'language');
    const labels: Record<string, string> = { es: 'Español', en: 'English', fr: 'Français' };
    return Object.entries(counts)
      .filter(([key]) => key !== 'unknown')
      .map(([lang, count], i) => ({ 
        name: labels[lang] || lang, 
        value: count,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));
  }, [events]);

  // Top content
  const topContent = useMemo(() => {
    const contentEvents = events.filter(e => e.resource_id && e.resource_id !== '');
    const counts: Record<string, { count: number; type: string; id: string }> = {};
    for (const e of contentEvents) {
      const key = `${e.resource_type || 'unknown'}:${e.resource_id}`;
      if (!counts[key]) counts[key] = { count: 0, type: e.resource_type || '', id: e.resource_id || '' };
      counts[key].count++;
    }
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [events]);

  // Recent events
  const recentEvents = useMemo(() => events.slice(0, 15), [events]);

  // Content type icons
  const contentTypeIcon = (type: string) => {
    switch (type) {
      case 'poi': return MapPin;
      case 'ar': return Smartphone;
      case 'tour': return Camera;
      case 'route': return RouteIcon;
      case 'vr': return Gamepad2;
      default: return Eye;
    }
  };

  const timeRangeLabels: Record<TimeRange, string> = {
    '24h': 'Últimas 24h',
    '7d': 'Últimos 7 días',
    '30d': 'Últimos 30 días',
    'all': 'Todo el tiempo',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Analytics Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">Asturias Inmersivo — Datos en tiempo real</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Time range selector */}
            <div className="flex bg-muted rounded-lg p-0.5">
              {(Object.keys(timeRangeLabels) as TimeRange[]).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    timeRange === range 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {timeRangeLabels[range]}
                </button>
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={loadEvents} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Status */}
        {(error || loading) && (
          <div className="bg-muted/50 border border-border rounded-xl p-4 text-xs font-mono space-y-1">
            <p>Estado: {loading ? '⏳ Cargando...' : '✅ Cargado'} | Eventos: <strong>{events.length}</strong></p>
            {error && <p className="text-destructive">❌ {error}</p>}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard 
            icon={Activity} 
            title="Total eventos" 
            value={totalEvents.toLocaleString()} 
            subtitle={timeRangeLabels[timeRange]}
            delay={0}
          />
          <MetricCard 
            icon={Users} 
            title="Sesiones únicas" 
            value={uniqueSessions.toLocaleString()} 
            delay={0.05}
          />
          <MetricCard 
            icon={Eye} 
            title="Vistas de página" 
            value={pageViews.toLocaleString()} 
            delay={0.1}
          />
          <MetricCard 
            icon={TrendingUp} 
            title="Interacciones" 
            value={contentInteractions.toLocaleString()} 
            subtitle="Tours, AR, Rutas, POIs"
            delay={0.15}
          />
        </div>

        {/* Activity over time */}
        <ChartCard title="Actividad por día" delay={0.2}>
          <div className="h-64">
            {eventsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={eventsByDay}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }} 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth={2}
                    fill="url(#colorCount)" 
                    name="Eventos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>No hay datos para este período</p>
              </div>
            )}
          </div>
        </ChartCard>

        {/* Charts row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Events by type */}
          <ChartCard title="Eventos por tipo" delay={0.25}>
            <div className="h-72">
              {eventsByType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventsByType} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis 
                      type="category" 
                      dataKey="type" 
                      tick={{ fontSize: 11 }} 
                      stroke="hsl(var(--muted-foreground))" 
                      width={95}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }} 
                    />
                    <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[0, 6, 6, 0]} name="Cantidad" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>No hay datos</p>
                </div>
              )}
            </div>
          </ChartCard>

          {/* Device & Language pie charts */}
          <div className="space-y-6">
            <ChartCard title="Dispositivos" delay={0.3}>
              <div className="h-48 flex items-center">
                {deviceBreakdown.length > 0 ? (
                  <div className="flex items-center w-full">
                    <ResponsiveContainer width="50%" height={180}>
                      <PieChart>
                        <Pie
                          data={deviceBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {deviceBreakdown.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            fontSize: '12px',
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {deviceBreakdown.map((d, i) => {
                        const DevIcon = DEVICE_ICONS[d.name.toLowerCase()] || Monitor;
                        const pct = totalEvents > 0 ? Math.round((d.value / totalEvents) * 100) : 0;
                        return (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <DevIcon className="w-4 h-4" style={{ color: d.color }} />
                            <span className="text-foreground font-medium">{d.name}</span>
                            <span className="text-muted-foreground ml-auto">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="w-full text-center text-muted-foreground">No hay datos</div>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Idiomas" delay={0.35}>
              <div className="h-48 flex items-center">
                {languageBreakdown.length > 0 ? (
                  <div className="flex items-center w-full">
                    <ResponsiveContainer width="50%" height={180}>
                      <PieChart>
                        <Pie
                          data={languageBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {languageBreakdown.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            fontSize: '12px',
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {languageBreakdown.map((l, i) => {
                        const pct = totalEvents > 0 ? Math.round((l.value / totalEvents) * 100) : 0;
                        return (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Globe className="w-4 h-4" style={{ color: l.color }} />
                            <span className="text-foreground font-medium">{l.name}</span>
                            <span className="text-muted-foreground ml-auto">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="w-full text-center text-muted-foreground">No hay datos</div>
                )}
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top content */}
          <ChartCard title="Contenido más popular" delay={0.4}>
            <div className="space-y-3">
              {topContent.length > 0 ? topContent.map((item, i) => {
                const Icon = contentTypeIcon(item.type);
                const maxCount = topContent[0]?.count || 1;
                const pct = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-muted">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground truncate">{item.id}</span>
                        <span className="text-xs text-muted-foreground ml-2">{item.count}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-muted-foreground text-sm text-center py-8">No hay datos de contenido</p>
              )}
            </div>
          </ChartCard>

          {/* Recent events */}
          <ChartCard title="Eventos recientes" delay={0.45}>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentEvents.length > 0 ? recentEvents.map((event, i) => (
                <div key={event.id || i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    event.event_type.includes('error') ? 'bg-destructive' :
                    event.event_type.includes('completed') ? 'bg-green-500' :
                    event.event_type.includes('started') ? 'bg-blue-500' :
                    'bg-muted-foreground'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {EventTypeLabel(event.event_type)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.device_type} · {event.language} · {new Date(event.created_at).toLocaleString('es-ES', { 
                        hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' 
                      })}
                    </p>
                  </div>
                  {event.resource_id && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md truncate max-w-24">
                      {event.resource_id}
                    </span>
                  )}
                </div>
              )) : (
                <p className="text-muted-foreground text-sm text-center py-8">No hay eventos recientes</p>
              )}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;

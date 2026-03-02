-- =====================================================
-- ASTURIAS XR DATABASE MIGRATION
-- 1. Drop pois_files_1 (duplicate table)
-- 2. Clean orphan pois_files records
-- 3. Add indexes for performance
-- 4. Migrate lat/lng to PostGIS geometry
-- 5. Add audio fields to ar_scenes (missing from schema)
-- 6. Clean old revisions/activity
-- =====================================================

-- =====================================================
-- STEP 1: Drop duplicate table pois_files_1
-- =====================================================
DROP TABLE IF EXISTS pois_files_1;

-- =====================================================
-- STEP 2: Clean orphan records in pois_files
-- =====================================================
DELETE FROM pois_files WHERE pois_id IS NULL;
-- Also remove references to non-existent pois
DELETE FROM pois_files WHERE pois_id NOT IN (SELECT id FROM pois);
-- Remove references to non-existent files
DELETE FROM pois_files WHERE directus_files_id NOT IN (SELECT id FROM directus_files);

SELECT 'pois_files after cleanup:', COUNT(*) FROM pois_files;

-- =====================================================
-- STEP 3: Add performance indexes
-- =====================================================

-- pois indexes
CREATE INDEX IF NOT EXISTS idx_pois_route_id ON pois(route_id);
CREATE INDEX IF NOT EXISTS idx_pois_status ON pois(status);
CREATE INDEX IF NOT EXISTS idx_pois_audio_es ON pois(audio_es) WHERE audio_es IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pois_audio_en ON pois(audio_en) WHERE audio_en IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pois_audio_fr ON pois(audio_fr) WHERE audio_fr IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pois_experience_type ON pois(experience_type);
CREATE INDEX IF NOT EXISTS idx_pois_featured ON pois(featured) WHERE featured = true;

-- routes indexes
CREATE INDEX IF NOT EXISTS idx_routes_status ON routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_slug ON routes(slug);
CREATE INDEX IF NOT EXISTS idx_routes_featured ON routes(featured) WHERE featured = true;

-- museums indexes
CREATE INDEX IF NOT EXISTS idx_museums_status ON museums(status);
CREATE INDEX IF NOT EXISTS idx_museums_slug ON museums(slug);

-- ar_scenes indexes
CREATE INDEX IF NOT EXISTS idx_ar_scenes_status ON ar_scenes(status);
CREATE INDEX IF NOT EXISTS idx_ar_scenes_slug ON ar_scenes(slug);

-- tours_360 indexes
CREATE INDEX IF NOT EXISTS idx_tours_360_status ON tours_360(status);
CREATE INDEX IF NOT EXISTS idx_tours_360_slug ON tours_360(slug);

-- analytics_events indexes (for dashboard queries)
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_resource ON analytics_events(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id);

SELECT 'Indexes created successfully' AS status;

-- =====================================================
-- STEP 4: Migrate lat/lng to PostGIS geometry
-- =====================================================

-- Enable PostGIS (already installed)
CREATE EXTENSION IF NOT EXISTS postgis;

-- pois: add geometry column
ALTER TABLE pois ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);
UPDATE pois SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pois_location ON pois USING GIST(location);

-- routes: add center geometry
ALTER TABLE routes ADD COLUMN IF NOT EXISTS center_location geometry(Point, 4326);
UPDATE routes SET center_location = ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326) WHERE center_lat IS NOT NULL AND center_lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_routes_center_location ON routes USING GIST(center_location);

-- museums: add geometry column
ALTER TABLE museums ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);
UPDATE museums SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_museums_location ON museums USING GIST(location);

-- ar_scenes: has location_lat/location_lng
ALTER TABLE ar_scenes ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);
UPDATE ar_scenes SET location = ST_SetSRID(ST_MakePoint(location_lng, location_lat), 4326) WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ar_scenes_location ON ar_scenes USING GIST(location);

SELECT 'PostGIS migration done' AS status;
SELECT 'pois with location:', COUNT(*) FROM pois WHERE location IS NOT NULL;
SELECT 'museums with location:', COUNT(*) FROM museums WHERE location IS NOT NULL;

-- =====================================================
-- STEP 5: Add missing audio fields to ar_scenes
-- (ar_scenes has audio_es/en/fr in types but not in DB)
-- =====================================================
ALTER TABLE ar_scenes ADD COLUMN IF NOT EXISTS audio_es UUID REFERENCES directus_files(id) ON DELETE SET NULL;
ALTER TABLE ar_scenes ADD COLUMN IF NOT EXISTS audio_en UUID REFERENCES directus_files(id) ON DELETE SET NULL;
ALTER TABLE ar_scenes ADD COLUMN IF NOT EXISTS audio_fr UUID REFERENCES directus_files(id) ON DELETE SET NULL;

SELECT 'ar_scenes audio fields added' AS status;

-- =====================================================
-- STEP 6: Clean old revisions and activity (keep 30 days)
-- =====================================================
DELETE FROM directus_revisions
WHERE activity IN (
  SELECT id FROM directus_activity
  WHERE timestamp < NOW() - INTERVAL '30 days'
);

DELETE FROM directus_activity WHERE timestamp < NOW() - INTERVAL '30 days';

SELECT 'directus_revisions remaining:', COUNT(*) FROM directus_revisions;
SELECT 'directus_activity remaining:', COUNT(*) FROM directus_activity;

-- =====================================================
-- STEP 7: VACUUM to reclaim disk space
-- =====================================================
VACUUM ANALYZE pois;
VACUUM ANALYZE routes;
VACUUM ANALYZE museums;
VACUUM ANALYZE ar_scenes;
VACUUM ANALYZE analytics_events;
VACUUM ANALYZE directus_revisions;
VACUUM ANALYZE directus_activity;
VACUUM ANALYZE pois_files;

SELECT 'Migration complete!' AS status;

-- 1. Custom table column overview
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name IN ('pois','routes','museums','ar_scenes','tours_360','categories','analytics_events','pois_translations','routes_translations')
ORDER BY table_name, ordinal_position;

-- 2. Indexes on custom tables
SELECT t.relname AS table_name, i.relname AS index_name, ix.indisunique, array_agg(a.attname ORDER BY k.n) AS columns
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_attribute a ON a.attrelid = t.oid
JOIN generate_subscripts(ix.indkey, 1) AS k(n) ON a.attnum = ix.indkey[k.n]
WHERE t.relname IN ('pois','routes','museums','ar_scenes','tours_360','categories','analytics_events')
GROUP BY t.relname, i.relname, ix.indisunique
ORDER BY t.relname, i.relname;

-- 3. Table sizes
SELECT relname AS table_name,
  pg_size_pretty(pg_total_relation_size(oid)) AS total_size,
  pg_size_pretty(pg_relation_size(oid)) AS table_size,
  n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(oid) DESC;

-- 4. Duplicate/orphan audio files check
SELECT id, audio_es, audio_en, audio_fr, audio_duration_seconds, audio_duration_seconds_en, audio_duration_seconds_fr
FROM pois;

-- 5. analytics_events structure and count
SELECT COUNT(*), MIN(timestamp), MAX(timestamp) FROM analytics_events;

-- 6. Unused pois_files_1 table
SELECT COUNT(*) FROM pois_files_1;

-- 7. Check for missing foreign key indexes
SELECT conrelid::regclass AS table, conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE contype = 'f'
  AND conrelid::regclass::text IN ('pois','routes','museums','ar_scenes','tours_360')
ORDER BY conrelid::regclass::text;

# Directus CMS — Content Management Guide

This guide explains how to fill in the Directus CMS so that the frontend application correctly displays routes, POIs, tours, AR scenes, and VR experiences.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Languages](#languages)
- [Categories](#categories)
- [Museums](#museums)
- [Routes](#routes)
- [POIs (Points of Interest)](#pois-points-of-interest)
- [360° Virtual Tours](#360-virtual-tours)
- [AR Scenes](#ar-scenes)
- [VR Experiences](#vr-experiences)
- [File Uploads & Assets](#file-uploads--assets)
- [3DVista / Needle Engine Dist Deployment](#3dvista--needle-engine-dist-deployment)
- [URL Routing & Slugs](#url-routing--slugs)
- [Status & Publishing](#status--publishing)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
Frontend (React + Vite)          Directus CMS (localhost:8055)
┌──────────────────────┐         ┌──────────────────────────┐
│  /tours              │ ◄────── │  tours_360               │
│  /tours/:slug        │         │  tours_360_translations   │
│  /ar                 │ ◄────── │  ar_scenes               │
│  /ar/:slug           │         │  ar_scenes_translations   │
│  /vr                 │ ◄────── │  vr_experiences           │
│  /routes             │ ◄────── │  routes + pois            │
│  /                   │ ◄────── │  museums, categories      │
└──────────────────────┘         └──────────────────────────┘
         │
         ▼
  public/tours-builds/{slug}/   ← extracted 3DVista ZIPs
  public/ar-builds/{slug}/      ← extracted Needle Engine ZIPs
```

All content is loaded from Directus via its REST API. No mock or static data exists in the frontend.

---

## Languages

The CMS supports three languages: **es** (Spanish), **en** (English), **fr** (French).

Every translatable collection has a `*_translations` junction table. When creating/editing an item, you must provide translations for at least **es** (primary). English and French are optional but recommended.

---

## Categories

**Collection:** `categories`

Categories are used to filter routes and POIs.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | ✅ | Unique identifier (e.g., `nature`, `heritage`, `culture`) |
| `icon` | string | ✅ | Lucide icon name (e.g., `Mountain`, `Landmark`, `BookOpen`, `Compass`, `UtensilsCrossed`) |
| `color` | string | ✅ | Hex color (e.g., `#10b981`, `#f59e0b`, `#8b5cf6`) |
| `order` | integer | ✅ | Display order (1, 2, 3...) |
| `status` | string | ✅ | `published` or `draft` |

**Translations** (`categories_translations`):

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ | Category display name (e.g., "Naturaleza" / "Nature") |
| `description` | | Optional description |

**Important:** Routes and POIs reference categories by `slug`. Make sure slugs are stable and don't change after items reference them.

---

## Museums

**Collection:** `museums`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | ✅ | URL-friendly identifier |
| `museum_code` | string | | Internal code |
| `address` | string | | Physical address |
| `municipality` | string | ✅ | Municipality name |
| `lat` | float | ✅ | Latitude |
| `lng` | float | ✅ | Longitude |
| `cover_image` | file | | Main image (upload to Directus Files) |
| `website` | string | | Website URL |
| `phone` | string | | Phone number |
| `email` | string | | Email |
| `museum_type` | enum | | `industrial`, `mining`, `railway`, `ethnographic`, `art`, `science` |
| `featured` | boolean | | Show on homepage |
| `status` | string | ✅ | `published` or `draft` |

**Translations:**

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ | Museum name |
| `short_description` | | Brief description |
| `description` | | Full description |
| `opening_hours` | | Opening hours text |
| `prices` | | Pricing info |
| `accessibility` | | Accessibility info |

---

## Routes

**Collection:** `routes`

Routes are displayed on the map at `/routes`. Each route contains ordered POIs.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `route_code` | string | ✅ | Unique route code (e.g., `RUTA-001`) — used as display ID |
| `slug` | string | ✅ | URL-friendly identifier |
| `cover_image` | file | | Route cover image |
| `difficulty` | enum | ✅ | `easy`, `medium`, `hard` |
| `is_circular` | boolean | ✅ | Whether the route is a loop |
| `distance_km` | float | | Total distance in km |
| `elevation_gain_meters` | integer | | Elevation gain |
| `surface_type` | enum | | `paved`, `gravel`, `dirt`, `mixed` |
| `center_lat` | float | | Map center latitude (auto-calculated if empty) |
| `center_lng` | float | | Map center longitude |
| `polyline` | JSON | | Array of `{lat, lng}` for the route line on the map |
| `gpx_file` | file | | GPX track file |
| `featured` | boolean | | Featured route |
| `status` | string | ✅ | `published` or `draft` |

**Translations:**

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Route name |
| `short_description` | ✅ | Brief description (shown in cards) |
| `description` | | Full description |
| `theme` | | Route theme (e.g., "Patrimonio Industrial") |
| `duration` | | Duration text (e.g., "2-3 horas") |

**Categories relation:** Routes have a many-to-many relation with categories via `routes_categories`. Assign categories to enable filtering.

**Polyline format:**
```json
[
  {"lat": 43.2630, "lng": -5.5220},
  {"lat": 43.2635, "lng": -5.5215},
  {"lat": 43.2640, "lng": -5.5210}
]
```

---

## POIs (Points of Interest)

**Collection:** `pois`

POIs are the individual stops within routes. They appear as markers on the map.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | ✅ | URL-friendly identifier |
| `experience_type` | enum | ✅ | `AR`, `360`, `INFO`, `VR` — determines the icon and behavior |
| `route_id` | relation | | Which route this POI belongs to |
| `order` | integer | ✅ | Order within the route (1, 2, 3...) |
| `lat` | float | ✅ | Latitude |
| `lng` | float | ✅ | Longitude |
| `address` | string | | Physical address |
| `cover_image` | file | | Cover image |
| `audio_es` | file | | Spanish audio guide file |
| `audio_en` | file | | English audio guide file |
| `audio_fr` | file | | French audio guide file |
| `video_url` | string | | Video URL |
| `ar_scene_id` | relation | | Linked AR scene |
| `tour_360_id` | relation | | Linked 360° tour |
| `museum_id` | relation | | Linked museum |
| `phone` | string | | Contact phone |
| `email` | string | | Contact email |
| `website` | string | | Website URL |
| `tags` | JSON | | Array of tag strings |
| `is_required` | boolean | | Must-visit point |
| `status` | string | ✅ | `published` or `draft` |

**Translations:**

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | POI name |
| `short_description` | ✅ | Brief description |
| `description` | | Full description |
| `how_to_get` | | Directions text |
| `accessibility` | | Accessibility info |
| `parking` | | Parking info |
| `opening_hours` | | Opening hours |
| `prices` | | Pricing |
| `recommended_duration` | | Suggested visit time |

**experience_type behavior:**
- `AR` — Shows AR launch button, links to `ar_scene_id`
- `360` — Shows 360° tour viewer, links to `tour_360_id`
- `INFO` — Standard informational POI
- `VR` — Links to VR experience

---

## 360° Virtual Tours

**Collection:** `tours_360`

Tours are displayed at `/tours` and opened in a modal viewer at `/tours/:slug`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | ✅ | URL-friendly identifier — **used in the browser URL** |
| `thumbnail` | file | | Tour thumbnail image |
| `build_zip` | file | | **3DVista dist ZIP archive** (uploaded to Directus Files) |
| `build_path` | string | | Path to deployed dist (e.g., `/tours-builds/mumi/`) — **auto-set by extract script** |
| `museum_id` | relation | | Associated museum |
| `total_panoramas` | integer | | Number of panoramas |
| `duration_minutes` | integer | | Estimated duration |
| `has_audio` | boolean | | Has audio narration |
| `vr_compatible` | boolean | | Compatible with VR headsets |
| `status` | string | ✅ | `published` or `draft` |

**Translations:**

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Tour name (e.g., "MUMI – Museo de la Minería") |
| `description` | | Tour description |

### How tours are displayed:

1. If `build_path` is set → tour loads in an iframe from that path
2. If `build_path` is empty → shows "Tour no disponible" message
3. The `build_zip` field stores the original ZIP for extraction

### Workflow for adding a new 360° tour:

1. Export your 3DVista project as a ZIP
2. Upload the ZIP to Directus Files
3. Create a new `tours_360` item with `slug` and `build_zip` pointing to the uploaded file
4. Run: `node scripts/extract-tours.js`
5. The script will:
   - Download the ZIP from Directus
   - Extract it to `public/tours-builds/{slug}/`
   - Auto-set `build_path` to `/tours-builds/{slug}/`
6. Restart the Vite dev server

---

## AR Scenes

**Collection:** `ar_scenes`

AR scenes are listed at `/ar` and viewed at `/ar/:slug`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | ✅ | URL-friendly identifier — **used in the browser URL** |
| `ar_type` | enum | ✅ | `slam`, `image-tracking`, `geo` |
| `build_zip` | file | | **Needle Engine dist ZIP** |
| `build_path` | string | | Path to deployed dist (e.g., `/ar-builds/playa-griega-ar/`) |
| `difficulty` | enum | ✅ | `easy`, `moderate`, `advanced` |
| `duration_minutes` | integer | ✅ | Estimated duration |
| `requires_outdoors` | boolean | ✅ | Needs outdoor environment |
| `preview_image` | file | | Preview image |
| `preview_video` | file | | Preview video |
| `location_lat` | float | | For geo AR: latitude |
| `location_lng` | float | | For geo AR: longitude |
| `location_radius_meters` | float | | For geo AR: activation radius |
| `tracking_marker` | file | | For image-tracking: marker image |
| `marker_size_cm` | float | | Physical marker size |
| `status` | string | ✅ | `published` or `draft` |

**Translations:**

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | AR scene name |
| `description` | | Description |
| `instructions` | | Usage instructions |

### How AR scenes are displayed:

1. If `build_path` is set → loads Needle Engine dist in an iframe
2. If `build_path` is empty → uses `NeedleARViewer` component (WebXR)

### Workflow for adding a new AR scene:

Same as tours — upload ZIP, run `node scripts/extract-tours.js`, restart Vite.

---

## VR Experiences

**Collection:** `vr_experiences`

VR experiences are listed at `/vr`. They are APK downloads for VR headsets.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | ✅ | Identifier |
| `category` | enum | | `mine`, `industry`, `railway`, `cave`, `heritage`, `nature` |
| `apk_file` | file | | APK file for download |
| `apk_version` | string | | Version string |
| `apk_size_mb` | float | | File size |
| `thumbnail` | file | | Thumbnail image |
| `preview_video` | file | | Preview video |
| `duration_minutes` | integer | | Estimated duration |
| `difficulty` | enum | | `easy`, `moderate` |
| `compatible_devices` | JSON | | Array of device names (e.g., `["Quest 2", "Quest 3"]`) |
| `status` | string | ✅ | `published` or `draft` |

**Translations:**

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Experience name |
| `description` | | Full description |
| `short_description` | | Brief description |

---

## File Uploads & Assets

All files (images, ZIPs, APKs, audio) are uploaded to **Directus Files** (`directus_files`).

- **Images:** Upload as JPEG/PNG/WebP. Referenced by UUID in collection fields.
- **Audio guides:** Upload MP3 files. Referenced in POI `audio_es`, `audio_en`, `audio_fr` fields.
- **ZIP archives:** Upload 3DVista or Needle Engine dist ZIPs. Referenced in `build_zip` fields.
- **APK files:** Upload VR APKs. Referenced in `apk_file` field.

File URLs are constructed as: `{DIRECTUS_URL}/assets/{file_uuid}`

---

## 3DVista / Needle Engine Dist Deployment

The `scripts/extract-tours.js` script handles both tours and AR scenes:

```bash
# Extract all ZIPs from Directus to public/
node scripts/extract-tours.js

# What it does:
# 1. Fetches tours_360 items with build_zip set
# 2. Downloads each ZIP from Directus
# 3. Extracts to public/tours-builds/{slug}/
# 4. Auto-sets build_path if not already set
# 5. Same for ar_scenes → public/ar-builds/{slug}/
```

**After extraction, restart the Vite dev server** so the middleware serves the new files.

The Vite middleware in `vite.config.ts` serves `/tours-builds/` and `/ar-builds/` as static files, handling both `index.htm` (3DVista) and `index.html` (Needle Engine).

---

## URL Routing & Slugs

The frontend uses slugs for URL routing:

| URL Pattern | Source | Description |
|-------------|--------|-------------|
| `/tours` | — | Tours list page |
| `/tours/:slug` | `tours_360.slug` | Opens specific tour in modal |
| `/ar` | — | AR experiences list |
| `/ar/:slug` | `ar_scenes.slug` | Individual AR scene page |
| `/vr` | — | VR experiences list |
| `/routes` | — | Routes map page |

**Slug rules:**
- Must be unique within each collection
- Use lowercase, hyphens only (e.g., `mumi`, `playa-griega-ar`, `pozo-fondon`)
- Do not change slugs after deployment — they are used in URLs and file paths

---

## Status & Publishing

All content collections support three statuses:

| Status | Behavior |
|--------|----------|
| `published` | Visible in the frontend |
| `draft` | Also visible (for development) |
| `archived` | Hidden from the frontend |

> **Note:** During development, both `published` and `draft` items are shown. In production, you may want to filter to `published` only.

---

## Troubleshooting

### Tour/AR scene shows "not available"
- Check that `build_path` is set in Directus
- Run `node scripts/extract-tours.js` to extract ZIPs
- Restart Vite dev server
- Verify files exist in `public/tours-builds/{slug}/` or `public/ar-builds/{slug}/`

### Tour loads but shows blank/error
- Check browser console for 404 errors on assets
- Verify the extracted dist has `index.htm` or `index.html`
- Test directly: `http://localhost:8080/tours-builds/{slug}/`

### Categories don't appear
- Ensure categories have `status: published` and translations with `name` filled
- Check that routes/POIs have categories assigned via the M2M relation

### POIs don't show on map
- Verify `lat` and `lng` are set
- Verify `route_id` links to the correct route
- Verify `order` is set (determines display order)

### Translations missing
- Each item needs at least Spanish (`es`) translations
- Check the `*_translations` junction table has entries for the item

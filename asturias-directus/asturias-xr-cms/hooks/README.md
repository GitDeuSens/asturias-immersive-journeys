# Audio Duration Hook Installation Guide

## Overview
This hook automatically extracts audio duration from uploaded audio files and updates the `duration` field in `directus_files` and `audio_duration_seconds` in related POIs.

## Installation Steps

### 1. Install Dependencies
Navigate to the hooks directory in your Directus installation and install dependencies:

```bash
cd /path/to/asturias-directus/asturias-xr-cms/hooks
npm install music-metadata axios
```

### 2. Register the Hook
Add the hook to your Directus configuration. In your `.env` file or Directus configuration:

```env
EXTENSIONS_PATH=./extensions
HOOKS_PATH=./hooks
```

### 3. Add ADMIN_TOKEN to environment

The hook needs a static admin token to download audio files:

```env
ADMIN_TOKEN=asturias-creator-hub-admin-2024
```

### 4. Restart Directus
Restart your Directus instance for the hook to be loaded:

```bash
npx directus start
```

## How It Works

1. **When an audio file is uploaded or updated**:
   - The hook checks if the file is an audio type (`audio/*`)
   - Downloads the file to extract metadata using `music-metadata`
   - Updates the `duration` field in `directus_files` table

2. **For related POIs**:
   - Searches for POIs that reference this audio file
   - Updates their `audio_duration_seconds` field with the extracted duration

## Testing

1. Upload a new audio file to Directus
2. Check the file record - `duration` should be populated
3. If the audio is linked to a POI, check that `audio_duration_seconds` is updated

## Troubleshooting

- Check Directus logs for any errors from the hook
- Ensure the hook file has proper permissions
- Verify dependencies are installed correctly

## Notes

- The hook only processes files when they're created or updated
- Existing files will need to be re-saved or updated manually to trigger the hook
- Duration is rounded to the nearest second

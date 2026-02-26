// Single source of truth for the Directus base URL
export const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://back.asturias.digitalmetaverso.com';

/**
 * Build a public asset URL from a Directus file UUID.
 */
export function getDirectusAssetUrl(fileId: string | undefined | null): string {
  if (!fileId) return '';
  return `${DIRECTUS_URL}/assets/${fileId}`;
}

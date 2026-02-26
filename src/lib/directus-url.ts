// Single source of truth for the Directus base URL
export const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';

/**
 * Build a public asset URL from a Directus file UUID.
 */
export function getDirectusAssetUrl(fileId: string | undefined | null): string {
  if (!fileId) return '';
  return `${DIRECTUS_URL}/assets/${fileId}`;
}

// URL Slug utilities for SEO-friendly URLs
// Generates consistent, readable slugs from any text

/**
 * Convert any text to a URL-friendly slug
 * Handles Spanish/French special characters
 */
export function slugify(text: string): string {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace Spanish/French special characters
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/ü/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/à/g, 'a')
    .replace(/è/g, 'e')
    .replace(/ù/g, 'u')
    .replace(/â/g, 'a')
    .replace(/ê/g, 'e')
    .replace(/î/g, 'i')
    .replace(/ô/g, 'o')
    .replace(/û/g, 'u')
    .replace(/ë/g, 'e')
    .replace(/ï/g, 'i')
    .replace(/ÿ/g, 'y')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    // Remove any remaining accents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove all non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique slug with ID suffix for guaranteed uniqueness
 * Format: "text-slug-id"
 */
export function slugifyWithId(text: string, id: string): string {
  const textSlug = slugify(text);
  const idSlug = slugify(id);
  
  if (!textSlug) return idSlug;
  if (!idSlug) return textSlug;
  
  return `${textSlug}-${idSlug}`;
}

/**
 * Extract ID from a slug that was created with slugifyWithId
 * Assumes ID is the last hyphen-separated segment that matches known ID patterns
 */
export function extractIdFromSlug(slug: string, knownIds: string[]): string | null {
  if (!slug) return null;
  
  // First try exact match
  const exactMatch = knownIds.find(id => slug.endsWith(`-${slugify(id)}`));
  if (exactMatch) return exactMatch;
  
  // Try finding the ID pattern in the slug
  for (const id of knownIds) {
    if (slug.includes(slugify(id))) {
      return id;
    }
  }
  
  return null;
}

/**
 * Check if a URL slug matches a given title/id combination
 */
export function matchesSlug(urlSlug: string, title: string, id: string): boolean {
  const expectedSlug = slugifyWithId(title, id);
  const titleOnlySlug = slugify(title);
  const idOnlySlug = slugify(id);
  
  return urlSlug === expectedSlug || urlSlug === titleOnlySlug || urlSlug === idOnlySlug || urlSlug === id;
}

/**
 * Get the base path from Vite environment
 * Returns "/" if not configured
 */
export function getBasePath(): string {
  return import.meta.env.VITE_BASE_PATH || '/';
}

/**
 * Create a full path including base path
 */
export function createPath(path: string): string {
  const basePath = getBasePath();
  const cleanBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return cleanBase === '' ? cleanPath : `${cleanBase}${cleanPath}`;
}

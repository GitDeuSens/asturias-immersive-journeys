// API configuration constants

export const API_CONFIG = {
  // Content status filters
  STATUS_FILTERS: {
    DEVELOPMENT: ['published', 'draft'] as const,
    PRODUCTION: ['published'] as const,
  },
  
  // Get current status filter based on environment
  getStatusFilter(): ('published' | 'draft')[] {
    return import.meta.env.DEV 
      ? this.STATUS_FILTERS.DEVELOPMENT 
      : this.STATUS_FILTERS.PRODUCTION;
  }
} as const;

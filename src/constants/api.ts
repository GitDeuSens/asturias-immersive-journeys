// API configuration constants

export const API_CONFIG = {
  // Content status filters — always show only published content
  STATUS_FILTERS: {
    DEFAULT: ['published'] as const,
  },
  
  // Get current status filter — always published only
  getStatusFilter(): ('published')[] {
    return [...this.STATUS_FILTERS.DEFAULT];
  }
} as const;

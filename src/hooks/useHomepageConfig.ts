import { useQuery } from '@tanstack/react-query';
import { DIRECTUS_URL } from '@/lib/directus-url';

export interface HomepageConfig {
  id: string | null;
  splash_logo: string | null;
  splash_title: string | null;
  splash_subtitle: string | null;
  splash_bg_color: string | null;
  main_title: Record<string, string>;
  main_subtitle: Record<string, string>;
  card1_title: Record<string, string>;
  card1_description: Record<string, string>;
  card1_icon: string | null;
  card2_title: Record<string, string>;
  card2_description: Record<string, string>;
  card2_icon: string | null;
  skip_link: Record<string, string>;
  detail1_heading: Record<string, string>;
  detail1_description: Record<string, string>;
  detail1_cta: Record<string, string>;
  detail1_bg_image: string | null;
  detail2_heading: Record<string, string>;
  detail2_description: Record<string, string>;
  detail2_cta: Record<string, string>;
  detail2_bg_image: string | null;
}

function buildMultilingual(raw: any, prefix: string): Record<string, string> {
  return {
    es: raw?.[`${prefix}_es`] || '',
    en: raw?.[`${prefix}_en`] || '',
    fr: raw?.[`${prefix}_fr`] || '',
  };
}

async function fetchHomepageConfig(): Promise<HomepageConfig | null> {
  const res = await fetch(`${DIRECTUS_URL}/items/homepage`);
  if (!res.ok) return null;
  const json = await res.json();
  const d = json.data;
  if (!d || !d.id) return null;

  return {
    id: d.id,
    splash_logo: d.splash_logo || null,
    splash_title: d.splash_title || null,
    splash_subtitle: d.splash_subtitle || null,
    splash_bg_color: d.splash_bg_color || null,
    main_title: buildMultilingual(d, 'main_title'),
    main_subtitle: buildMultilingual(d, 'main_subtitle'),
    card1_title: buildMultilingual(d, 'card1_title'),
    card1_description: buildMultilingual(d, 'card1_description'),
    card1_icon: d.card1_icon || null,
    card2_title: buildMultilingual(d, 'card2_title'),
    card2_description: buildMultilingual(d, 'card2_description'),
    card2_icon: d.card2_icon || null,
    skip_link: buildMultilingual(d, 'skip_link'),
    detail1_heading: buildMultilingual(d, 'detail1_heading'),
    detail1_description: buildMultilingual(d, 'detail1_description'),
    detail1_cta: buildMultilingual(d, 'detail1_cta'),
    detail1_bg_image: d.detail1_bg_image || null,
    detail2_heading: buildMultilingual(d, 'detail2_heading'),
    detail2_description: buildMultilingual(d, 'detail2_description'),
    detail2_cta: buildMultilingual(d, 'detail2_cta'),
    detail2_bg_image: d.detail2_bg_image || null,
  };
}

export function useHomepageConfig() {
  return useQuery({
    queryKey: ['homepage-config'],
    queryFn: fetchHomepageConfig,
    staleTime: 5 * 60 * 1000,
  });
}

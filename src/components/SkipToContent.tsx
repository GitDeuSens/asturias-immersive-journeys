import { useTranslation } from 'react-i18next';

export function SkipToContent() {
  const { t } = useTranslation();
  
  return (
    <a
      href="#main-content"
      className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100] focus-visible:px-4 focus-visible:py-2 focus-visible:bg-primary focus-visible:text-primary-foreground focus-visible:rounded-lg focus-visible:font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
    >
      {t('header.skipToContent')}
    </a>
  );
}
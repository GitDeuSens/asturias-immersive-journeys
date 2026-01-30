import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCcw, Mountain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SettingsDropdown } from '@/components/SettingsDropdown';
import { useTheme } from '@/hooks/useTheme';

interface AppHeaderProps {
  showRestart?: boolean;
  variant?: 'light' | 'dark';
}

export function AppHeader({ showRestart = true, variant = 'light' }: AppHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleRestart = () => {
    localStorage.removeItem('asturias-mode');
    navigate('/');
  };

  // Use actual dark mode state instead of variant prop
  const isLight = variant === 'light' && !isDark;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 ${isLight ? 'bg-background shadow-sm' : 'glass-panel'}`}
      style={{ borderBottom: isLight ? '3px solid hsl(var(--primary))' : undefined }}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo - Turismo Asturias inspired */}
        <Link 
          to="/experience"
          className="flex items-center gap-3 group"
          aria-label="Asturias Inmersivo - Inicio"
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <Mountain className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-lg text-foreground">
              Asturias
            </span>
            <span className="text-primary font-semibold text-sm ml-1 uppercase tracking-wider">
              Inmersivo
            </span>
          </div>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Settings dropdown (language + theme) */}
          <SettingsDropdown variant={isLight ? 'light' : 'dark'} />

          {/* Restart button */}
          {showRestart && (
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-semibold bg-muted hover:bg-primary hover:text-primary-foreground text-foreground"
              aria-label={t('common.restart')}
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t('common.restart')}</span>
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}

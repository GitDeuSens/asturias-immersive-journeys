import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCcw, Mountain } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface AppHeaderProps {
  showRestart?: boolean;
  variant?: 'light' | 'dark';
}

const texts = {
  restart: { es: 'Reiniciar', en: 'Restart', fr: 'Redémarrer' },
};

export function AppHeader({ showRestart = true, variant = 'dark' }: AppHeaderProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleRestart = () => {
    localStorage.removeItem('asturias-mode');
    navigate('/');
  };

  const isLight = variant === 'light';

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 ${isLight ? 'bg-white shadow-sm' : 'glass-panel'}`}
      style={{ borderBottom: isLight ? '3px solid hsl(79, 100%, 36%)' : undefined }}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo - Turismo Asturias inspired */}
        <Link 
          to="/experience"
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <Mountain className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className={`font-bold text-lg ${isLight ? 'text-foreground' : 'text-foreground'}`}>
              Asturias
            </span>
            <span className="text-primary font-semibold text-sm ml-1 uppercase tracking-wider">
              Inmersivo
            </span>
          </div>
        </Link>

        {/* Restart button */}
        {showRestart && (
          <button
            onClick={handleRestart}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-semibold ${
              isLight 
                ? 'bg-muted hover:bg-primary hover:text-white text-foreground' 
                : 'bg-muted/50 hover:bg-primary hover:text-white text-foreground'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">{t(texts.restart)}</span>
          </button>
        )}
      </div>
    </motion.header>
  );
}

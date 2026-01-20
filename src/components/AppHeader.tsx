import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCcw, Mountain } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface AppHeaderProps {
  showRestart?: boolean;
}

const texts = {
  restart: { es: 'Reiniciar', en: 'Restart', fr: 'Redémarrer' },
};

export function AppHeader({ showRestart = true }: AppHeaderProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleRestart = () => {
    localStorage.removeItem('asturias-mode');
    navigate('/');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 glass-panel"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/experience"
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <Mountain className="w-6 h-6 text-primary" />
          <span className="font-serif font-bold text-xl">Asturias</span>
          <span className="font-serif italic text-foreground/70 text-lg">Inmersivo</span>
        </Link>

        {/* Restart button */}
        {showRestart && (
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted text-foreground/80 hover:text-foreground transition-all duration-200 text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">{t(texts.restart)}</span>
          </button>
        )}
      </div>
    </motion.header>
  );
}

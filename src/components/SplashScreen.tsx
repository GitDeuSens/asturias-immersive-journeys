import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import principadoLogo from '@/assets/logos/principado-asturias.png';

const SPLASH_DURATION = 2200;
const SPLASH_KEY = 'asturias-splash-shown';

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(() => {
    // Show splash only once per session
    return !sessionStorage.getItem(SPLASH_KEY);
  });

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(SPLASH_KEY, '1');
    }, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[hsl(79,100%,36%)]"
          >
            {/* Animated logo */}
            <motion.img
              src={principadoLogo}
              alt="Principado de Asturias"
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain mb-6 drop-shadow-xl"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            />

            {/* Title */}
            <motion.h1
              className="text-white text-2xl sm:text-3xl font-bold tracking-tight text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Asturias Inmersivo
            </motion.h1>

            <motion.p
              className="text-white/80 text-sm sm:text-base mt-2 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              360° · AR · VR
            </motion.p>

            {/* Loading dots */}
            <motion.div
              className="flex gap-1.5 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/60"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}

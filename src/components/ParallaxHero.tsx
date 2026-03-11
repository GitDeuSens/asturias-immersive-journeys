import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxHeroProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Parallax hero section with scroll-based vertical movement.
 * Wraps content in a bg-primary container with subtle upward shift on scroll.
 */
export function ParallaxHero({ children, className = '' }: ParallaxHeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.7]);

  return (
    <div ref={ref} className={`bg-primary py-6 sm:py-12 mb-6 sm:mb-8 mt-2 overflow-hidden ${className}`}>
      <motion.div style={{ y, opacity }}>
        {children}
      </motion.div>
    </div>
  );
}

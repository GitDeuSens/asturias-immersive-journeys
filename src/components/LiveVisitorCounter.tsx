import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';

interface LiveVisitorCounterProps {
  routeId: string;
  viewCount?: number;
  className?: string;
}

/**
 * Shows total view count from the database (real data).
 * Only displays when viewCount > 0.
 */
export function LiveVisitorCounter({ viewCount = 0, className = '' }: LiveVisitorCounterProps) {
  if (viewCount <= 0) return null;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium text-primary ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
        >
          {count}
        </motion.span>
      </AnimatePresence>
      <Users className="w-3 h-3" />
    </span>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, View, Share2, Maximize2, Info } from 'lucide-react';

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  iframeUrl: string;
  title: string;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({
  isOpen,
  onClose,
  iframeUrl,
  title,
}) => {
  const handleFullscreen = () => {
    const el = document.querySelector('.fullscreen-tour-container');
    if (el) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        el.requestFullscreen?.();
      }
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {}
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black flex flex-col overflow-hidden"
        >
          {/* Header — same style as Tours360Page */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/90 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <View className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-white truncate">{title}</h2>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullscreen}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 gap-1 h-8 px-3"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Cerrar</span>
              </Button>
            </div>
          </div>

          {/* Tour iframe — fills remaining space */}
          <div className="fullscreen-tour-container flex-1 min-h-0">
            <iframe
              src={iframeUrl}
              className="w-full h-full"
              allowFullScreen
              allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
              title={title}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullscreenModal;

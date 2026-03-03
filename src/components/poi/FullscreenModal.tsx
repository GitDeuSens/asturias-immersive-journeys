import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Share2, Maximize2 } from 'lucide-react';

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
          className="fixed inset-0 z-[100] bg-black fullscreen-tour-container"
        >
          {/* Iframe fills entire screen */}
          <iframe
            src={iframeUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
            title={title}
          />

          {/* Floating controls overlaid on top of the tour */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 h-9 w-9 rounded-full"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 h-9 w-9 rounded-full"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 h-9 w-9 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Title floating bottom-left */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full">
              {title}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullscreenModal;

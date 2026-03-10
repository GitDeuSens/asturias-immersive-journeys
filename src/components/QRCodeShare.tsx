import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface QRCodeShareProps {
  url: string;
  title: string;
  size?: number;
}

export function QRCodeShare({ url, title, size = 180 }: QRCodeShareProps) {
  const [showQR, setShowQR] = useState(false);

  const handleDownload = () => {
    const svg = document.querySelector('#qr-share-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size * 2;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, size * 2, size * 2);
      const a = document.createElement('a');
      a.download = `qr-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowQR(true)}
        className="gap-2"
      >
        <QrCode className="w-4 h-4" />
        QR
      </Button>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-2xl p-6 max-w-xs w-full shadow-2xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground truncate flex-1">{title}</h3>
                <button onClick={() => setShowQR(false)} className="p-1.5 rounded-full hover:bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-center p-4 bg-white rounded-xl mb-4">
                <QRCodeSVG
                  id="qr-share-svg"
                  value={url}
                  size={size}
                  level="M"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#1a1a1a"
                />
              </div>
              <p className="text-xs text-muted-foreground mb-4 break-all">{url}</p>
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                Download PNG
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

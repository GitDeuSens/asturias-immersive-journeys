import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Link, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { trackShare } from '@/lib/analytics';

// Social icons as SVG
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

interface ShareButtonsProps {
  url?: string;
  title: string;
  description?: string;
  routeCode?: string;
  hashtags?: string[];
  className?: string;
  variant?: 'inline' | 'modal';
}

export function ShareButtons({ 
  url, 
  title, 
  description = '', 
  routeCode,
  hashtags = ['AsturiasParaisoNatural', 'AsturiasInmersivo'],
  className = '',
  variant = 'inline'
}: ShareButtonsProps) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const hashtagString = hashtags.map(h => `#${h}`).join(' ');
  const shareText = `${title}\n\n${description}\n\n${hashtagString}`;
  
  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
  };

  const handleCopyLink = async () => {
    if (routeCode) {
      try {
        await navigator.clipboard.writeText(shareUrl + `/${routeCode}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    trackShare(platform, 'content', url || window.location.pathname);
    window.open(shareLinks[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('whatsapp')}
          className="p-2 text-[#25D366] hover:bg-[#25D366]/10"
          aria-label={t('share.whatsapp')}
        >
          <WhatsAppIcon />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook')}
          className="p-2 text-[#1877F2] hover:bg-[#1877F2]/10"
          aria-label={t('share.facebook')}
        >
          <FacebookIcon />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          className="p-2 text-foreground hover:bg-muted"
          aria-label={t('share.twitter')}
        >
          <TwitterIcon />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="p-2"
          aria-label={t('share.copyLink')}
        >
          {copied ? <Check className="w-5 h-5 text-primary" /> : <Link className="w-5 h-5" />}
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className={className}
        aria-label={t('share.title')}
      >
        <Share2 className="w-4 h-4 mr-2" />
        {t('common.share')}
      </Button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-modal-title"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 id="share-modal-title" className="text-lg font-bold text-foreground">
                  {t('share.title')}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  aria-label={t('common.close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={t('share.whatsapp')}
                >
                  <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                    <WhatsAppIcon />
                  </div>
                  <span className="text-xs text-muted-foreground">WhatsApp</span>
                </button>
                
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={t('share.facebook')}
                >
                  <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2]">
                    <FacebookIcon />
                  </div>
                  <span className="text-xs text-muted-foreground">Facebook</span>
                </button>
                
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={t('share.twitter')}
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <TwitterIcon />
                  </div>
                  <span className="text-xs text-muted-foreground">Twitter</span>
                </button>
                
                <button
                  onClick={() => handleShare('email')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={t('share.email')}
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground">
                    <EmailIcon />
                  </div>
                  <span className="text-xs text-muted-foreground">Email</span>
                </button>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-foreground truncate focus:outline-none"
                  aria-label="URL"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Link className="w-4 h-4" />
                  )}
                  <span className="ml-2 text-xs">
                    {copied ? t('share.linkCopied') : t('share.copyLink')}
                  </span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

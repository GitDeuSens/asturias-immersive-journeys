/**
 * Glossary / Help dialog explaining AR, 360°, VR and other terms.
 * Accessible from header help button.
 */
import { Smartphone, Camera, Glasses, Info, MapPin, Map } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface GlossaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlossaryDialog({ open, onOpenChange }: GlossaryDialogProps) {
  const { t } = useTranslation();

  const entries = [
    {
      icon: Smartphone,
      iconClass: 'text-warm',
      bgClass: 'bg-warm/15',
      title: t('glossary.arTitle'),
      description: t('glossary.arDesc'),
    },
    {
      icon: Camera,
      iconClass: 'text-primary',
      bgClass: 'bg-primary/15',
      title: t('glossary.360Title'),
      description: t('glossary.360Desc'),
    },
    {
      icon: Glasses,
      iconClass: 'text-accent-foreground',
      bgClass: 'bg-accent/15',
      title: t('glossary.vrTitle'),
      description: t('glossary.vrDesc'),
    },
    {
      icon: Map,
      iconClass: 'text-primary',
      bgClass: 'bg-primary/15',
      title: t('glossary.routesTitle'),
      description: t('glossary.routesDesc'),
    },
    {
      icon: MapPin,
      iconClass: 'text-warm',
      bgClass: 'bg-warm/15',
      title: t('glossary.poiTitle'),
      description: t('glossary.poiDesc'),
    },
    {
      icon: Info,
      iconClass: 'text-muted-foreground',
      bgClass: 'bg-muted/50',
      title: t('glossary.visitedTitle'),
      description: t('glossary.visitedDesc'),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('glossary.title')}</DialogTitle>
          <DialogDescription>{t('glossary.subtitle')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {entries.map((entry, i) => {
            const Icon = entry.icon;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${entry.bgClass} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${entry.iconClass}`} />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{entry.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{entry.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

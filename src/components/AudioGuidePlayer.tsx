// ============ AUDIO GUIDE PLAYER ============
// Multilingual audio player with transcripts and speed control

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, VolumeX, Download, FileText,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { trackEvent, trackAudioPlayed, trackAudioCompleted } from '@/lib/analytics';
import type { AudioTrack, Language } from '@/lib/types';

interface AudioGuidePlayerProps {
  tracks: AudioTrack[];
  title?: string;
  autoPlay?: boolean;
  currentLocale?: Language;
  compact?: boolean;
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2];

const texts = {
  audioGuide: { es: 'Audioguía', en: 'Audio Guide', fr: 'Audioguide' },
  transcript: { es: 'Transcripción', en: 'Transcript', fr: 'Transcription' },
  download: { es: 'Descargar', en: 'Download', fr: 'Télécharger' },
  speed: { es: 'Velocidad', en: 'Speed', fr: 'Vitesse' },
  noAudio: { es: 'Audio no disponible', en: 'Audio not available', fr: 'Audio non disponible' },
};

export function AudioGuidePlayer({
  tracks,
  title,
  autoPlay = false,
  currentLocale = 'es',
  compact = false,
}: AudioGuidePlayerProps) {
  const [currentLang, setCurrentLang] = useState<Language>(currentLocale);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const currentTrack = tracks.find(t => t.language === currentLang) || tracks[0];

  // Auto-play on mount if enabled
  useEffect(() => {
    if (autoPlay && audioRef.current && currentTrack) {
      audioRef.current.play().catch(() => {
        // Autoplay blocked, user needs to interact
      });
    }
  }, [autoPlay, currentTrack]);

  // Track audio completion
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      if (currentTrack) {
        trackAudioCompleted(currentTrack.url, currentLang, 100);
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentTrack, currentLang]);

  // Update playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      trackEvent('audio_paused', {
        audio_url: currentTrack.url,
        position: currentTime,
      });
    } else {
      audioRef.current.play();
      trackAudioPlayed(currentTrack.url, currentLang);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentTrack, currentTime, currentLang]);

  const handleSeek = useCallback((value: number[]) => {
    const time = value[0];
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [currentTime, duration]);

  const changeLanguage = useCallback((lang: Language) => {
    const wasPlaying = isPlaying;
    const position = currentTime;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setCurrentLang(lang);
    setIsPlaying(false);

    // Restore position after language change
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = position;
        if (wasPlaying) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    }, 100);

    trackEvent('audio_language_changed', { language: lang });
  }, [isPlaying, currentTime]);

  const cycleSpeed = useCallback(() => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    setPlaybackRate(PLAYBACK_SPEEDS[nextIndex]);
    trackEvent('audio_speed_changed', { speed: PLAYBACK_SPEEDS[nextIndex] });
  }, [playbackRate]);

  const handleDownload = useCallback(() => {
    if (!currentTrack) return;
    
    const link = document.createElement('a');
    link.href = currentTrack.url;
    link.download = `audioguia-${currentLang}.mp3`;
    link.click();
    
    trackEvent('audio_downloaded', { language: currentLang });
  }, [currentTrack, currentLang]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
        {texts.noAudio[currentLocale]}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border border-border rounded-xl overflow-hidden ${compact ? 'p-3' : 'p-4'}`}
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      />

      {/* Header */}
      {title && !compact && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🎧</span>
          <h4 className="font-semibold text-foreground">{title}</h4>
        </div>
      )}

      {/* Main controls */}
      <div className="flex items-center gap-3">
        {/* Skip back */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => skip(-10)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Retroceder 10 segundos"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        {/* Play/Pause */}
        <Button
          variant="default"
          size="icon"
          onClick={togglePlay}
          className="w-12 h-12 rounded-full"
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>

        {/* Skip forward */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => skip(10)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Avanzar 10 segundos"
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        {/* Progress bar */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <Slider
            ref={progressRef}
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="flex-1"
            aria-label="Progreso del audio"
          />
          <span className="text-xs text-muted-foreground w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Speed control */}
        <Button
          variant="ghost"
          size="sm"
          onClick={cycleSpeed}
          className="text-xs font-mono text-muted-foreground hover:text-foreground min-w-[3rem]"
          aria-label="Cambiar velocidad"
        >
          {playbackRate}x
        </Button>

        {/* Volume */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          className="text-muted-foreground hover:text-foreground"
          aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Language selector & extras */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        {/* Language buttons */}
        <div className="flex items-center gap-1">
          {tracks.map((track) => (
            <Button
              key={track.language}
              variant={currentLang === track.language ? 'default' : 'ghost'}
              size="sm"
              onClick={() => changeLanguage(track.language)}
              className="text-xs uppercase"
            >
              {track.language}
            </Button>
          ))}
        </div>

        {/* Extra controls */}
        <div className="flex items-center gap-1">
          {/* Download */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Descargar audio"
          >
            <Download className="w-4 h-4" />
          </Button>

          {/* Transcript toggle */}
          {currentTrack.transcript && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Ver transcripción"
            >
              <FileText className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Transcript */}
      <AnimatePresence>
        {showTranscript && currentTrack.transcript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-foreground">
                  {texts.transcript[currentLocale]}
                </h5>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTranscript(false)}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
              </div>
              <div className="max-h-48 overflow-y-auto p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {currentTrack.transcript}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AudioGuidePlayer;

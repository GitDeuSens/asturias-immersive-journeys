import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        
        if (triggerOnce) {
          if (isVisible && !hasIntersected) {
            setIsIntersecting(true);
            setHasIntersected(true);
          }
        } else {
          setIsIntersecting(isVisible);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, hasIntersected]);

  return { targetRef, isIntersecting, hasIntersected };
}

// Hook для ленивой загрузки изображений
export function useLazyImage(
  src: string,
  options: UseIntersectionObserverOptions = {}
) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { targetRef, isIntersecting } = useIntersectionObserver(options);

  useEffect(() => {
    if (!isIntersecting || loadedSrc) return;

    setIsLoading(true);
    setError(null);

    const img = new Image();
    img.onload = () => {
      setLoadedSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
    };
    img.src = src;
  }, [isIntersecting, src, loadedSrc]);

  return { targetRef, loadedSrc, isLoading, error };
}

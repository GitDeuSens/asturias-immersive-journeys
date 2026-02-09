import { Suspense, lazy, ComponentType, useState, useEffect, useRef } from 'react';

interface LazyComponentProps {
  loader: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: any;
}

export function LazyComponent({ 
  loader, 
  fallback = <div className="animate-pulse bg-muted h-32 rounded-lg" />,
  props 
}: LazyComponentProps) {
  const LazyComp = lazy(loader);
  
  return (
    <Suspense fallback={fallback}>
      <LazyComp {...props} />
    </Suspense>
  );
}

// Hook for intersection observer based lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}

// Component for lazy loading heavy components
export function LazyHeavyComponent<T extends ComponentType<any>>({
  component: Component,
  fallback,
  ...props
}: {
  component: T;
  fallback?: React.ReactNode;
} & React.ComponentProps<T>) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useIntersectionObserver(ref, {
    threshold: 0.1,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (isVisible) return;
    setIsVisible(true);
  }, [isVisible]);

  return (
    <div ref={ref}>
      {isVisible ? (
        <Component {...(props as any)} />
      ) : (
        fallback || <div className="animate-pulse bg-muted h-32 rounded-lg" />
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';

// Hook to manage WebSocket connections for bfcache optimization
export function useWebSocketManager() {
  const [isWebSocketActive, setIsWebSocketActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Disable WebSocket on mobile for bfcache compatibility
    if (isMobile) {
      // Prevent WebSocket connections on mobile
      const originalWebSocket = window.WebSocket;
      
      // Override WebSocket constructor to prevent connections on mobile
      window.WebSocket = function(url: string | URL, protocols?: string | string[]) {
        console.warn('WebSocket disabled on mobile for bfcache optimization');
        // Return a mock WebSocket that does nothing
        const mockWS = {
          readyState: 3, // CLOSED
          close: () => {},
          send: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
          onopen: null,
          onclose: null,
          onmessage: null,
          onerror: null,
        } as any;
        
        return mockWS;
      } as any;
      
      // Restore original WebSocket when component unmounts or on desktop
      return () => {
        window.WebSocket = originalWebSocket;
      };
    }
  }, [isMobile]);

  return { isWebSocketActive, isMobile };
}

// Component to optimize bfcache compatibility
export function BFCacheOptimizer() {
  const { isMobile } = useWebSocketManager();

  useEffect(() => {
    // Optimize for bfcache
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from bfcache
        console.log('Page restored from bfcache');
        // Reinitialize any state that might have been lost
        window.dispatchEvent(new CustomEvent('bfcache-restore'));
      }
    };

    const handleBeforeUnload = () => {
      // Clean up before page unload to improve bfcache compatibility
      // Cancel any ongoing fetch requests
      if (window.stop) {
        window.stop();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    // Add bfcache optimization meta tags
    const addMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    if (isMobile) {
      addMetaTag('mobile-web-app-capable', 'yes');
      addMetaTag('apple-mobile-web-app-capable', 'yes');
      addMetaTag('format-detection', 'telephone=no');
    }

    // Add cache control headers for bfcache
    addMetaTag('cache-control', 'public, max-age=31536000, immutable');
    addMetaTag('expires', '31536000');

    return () => {
      // Clean up meta tags if needed
    };
  }, [isMobile]);

  return null;
}

// Hook for optimizing JavaScript loading
export function useJSOptimization() {
  useEffect(() => {
    // Optimize script loading for better performance
    const scripts = document.querySelectorAll('script[src]');
    
    scripts.forEach(script => {
      const htmlScript = script as HTMLScriptElement;
      
      // Add defer to non-critical scripts
      if (!htmlScript.hasAttribute('data-critical') && !htmlScript.defer && !htmlScript.async) {
        htmlScript.defer = true;
      }
      
      // Add crossorigin for external scripts
      if (htmlScript.src && htmlScript.src.includes('http') && !htmlScript.crossOrigin) {
        htmlScript.crossOrigin = 'anonymous';
      }
    });

    // Optimize preload for critical resources
    const addPreload = (href: string, as: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      document.head.appendChild(link);
    };

    // Preload critical CSS
    const criticalCSS = ['/index.css'];
    criticalCSS.forEach(href => addPreload(href, 'style'));

    // Preload critical fonts
    const criticalFonts = ['/fonts/inter-var.woff2'];
    criticalFonts.forEach(href => addPreload(href, 'font'));

    return () => {
      // Clean up preload links
      const preloads = document.querySelectorAll('link[rel="preload"]');
      preloads.forEach(link => link.remove());
    };
  }, []);
}

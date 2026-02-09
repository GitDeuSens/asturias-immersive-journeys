import { useEffect } from 'react';

// Component for optimizing Largest Contentful Paint (LCP)
export function LCPOptimizer({ heroImage }: { heroImage?: string }) {
  useEffect(() => {
    // Preload LCP image
    if (heroImage) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = heroImage;
      preloadLink.fetchPriority = 'high';
      document.head.appendChild(preloadLink);
      
      return () => {
        document.head.removeChild(preloadLink);
      };
    }
  }, [heroImage]);

  useEffect(() => {
    // Optimize font loading for LCP
    const fontPreload = document.createElement('link');
    fontPreload.rel = 'preload';
    fontPreload.href = '/fonts/inter-var.woff2';
    fontPreload.as = 'font';
    fontPreload.type = 'font/woff2';
    fontPreload.crossOrigin = 'anonymous';
    document.head.appendChild(fontPreload);

    // Add font-display CSS
    const fontStyle = document.createElement('style');
    fontStyle.textContent = `
      @font-face {
        font-family: 'Inter Variable';
        font-display: swap;
        src: url('/fonts/inter-var.woff2') format('woff2');
      }
    `;
    document.head.appendChild(fontStyle);

    return () => {
      document.head.removeChild(fontPreload);
      document.head.removeChild(fontStyle);
    };
  }, []);

  useEffect(() => {
    // Add critical CSS inlining
    const criticalCSS = `
      /* Critical CSS for LCP */
      .hero-section {
        contain: layout style paint;
        content-visibility: auto;
        contain-intrinsic-size: 100vh 100vw;
      }
      
      .hero-image {
        contain: layout style paint;
        content-visibility: auto;
        contain-intrinsic-size: 100vh 100vw;
      }
      
      /* Prevent layout shift */
      img {
        contain-intrinsic-size: auto 300px;
      }
      
      /* Optimize rendering */
      .lcp-optimised {
        contain: layout style paint;
        content-visibility: auto;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = criticalCSS;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return null;
}

// Hook for LCP optimization
export function useLCPOptimization() {
  useEffect(() => {
    // Set content-visibility for better LCP
    if ('contentVisibility' in document.documentElement.style) {
      document.documentElement.style.contentVisibility = 'auto';
    }

    // Optimize critical rendering path
    const optimizeCriticalPath = () => {
      // Find the largest content element
      const images = document.querySelectorAll('img');
      let largestImage: HTMLImageElement | null = null;
      let largestSize = 0;

      images.forEach(img => {
        const size = img.width * img.height;
        if (size > largestSize) {
          largestSize = size;
          largestImage = img;
        }
      });

      if (largestImage) {
        // Add fetchpriority to LCP image
        largestImage.fetchPriority = 'high';
        
        // Add loading="eager" to LCP image
        largestImage.loading = 'eager';
        
        // Add decoding="async" for better performance
        largestImage.decoding = 'async';
      }
    };

    // Run optimization after DOM is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizeCriticalPath);
    } else {
      optimizeCriticalPath();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', optimizeCriticalPath);
    };
  }, []);
}

// Component for optimizing resource loading
export function ResourceOptimizer() {
  useEffect(() => {
    // Add DNS prefetch for external domains
    const domains = [
      'localhost:8055',
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });

    // Add preconnect for critical domains
    const preconnectDomains = ['localhost:8055'];
    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = `http://${domain}`;
      document.head.appendChild(link);
    });

    return () => {
      // Clean up resource hints
      const links = document.querySelectorAll('link[rel="dns-prefetch"], link[rel="preconnect"]');
      links.forEach(link => link.remove());
    };
  }, []);

  return null;
}

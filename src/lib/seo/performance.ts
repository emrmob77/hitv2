/**
 * Performance Utilities for Core Web Vitals Optimization
 */

/**
 * Preload critical resources
 */
export function preloadCriticalAssets() {
  if (typeof window === 'undefined') return;

  // Preconnect to external domains
  const preconnectDomains = [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ].filter(Boolean);

  preconnectDomains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain as string;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImages() {
  if (typeof window === 'undefined') return;
  if ('loading' in HTMLImageElement.prototype) return; // Native lazy loading supported

  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
    }
  );

  images.forEach((img) => imageObserver.observe(img));
}

/**
 * Prefetch next page on link hover
 */
export function prefetchOnHover(href: string) {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Measure performance metrics
 */
export function measurePerformance(name: string) {
  if (typeof window === 'undefined') return;
  if (!window.performance || !window.performance.mark) return;

  return {
    start: () => window.performance.mark(`${name}-start`),
    end: () => {
      window.performance.mark(`${name}-end`);
      window.performance.measure(name, `${name}-start`, `${name}-end`);
      const measure = window.performance.getEntriesByName(name)[0];
      return measure?.duration || 0;
    },
  };
}

/**
 * Check if device has slow connection
 */
export function isSlowConnection(): boolean {
  if (typeof window === 'undefined') return false;
  if (!('connection' in navigator)) return false;

  const connection = (navigator as any).connection;
  if (!connection) return false;

  return (
    connection.saveData ||
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g'
  );
}

/**
 * Reduce motion check for accessibility
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

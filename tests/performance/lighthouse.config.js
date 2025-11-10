/**
 * Lighthouse CI Configuration
 *
 * This configuration is used for automated performance testing.
 * Run with: npx lighthouse-ci autorun
 */

module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/register',
        'http://localhost:3000/pricing',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/dashboard/bookmarks',
        'http://localhost:3000/dashboard/collections',
        'http://localhost:3000/dashboard/affiliate-links',
      ],
      // Number of runs per URL
      numberOfRuns: 3,
      // Start dev server before collecting
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 60000,
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      // Performance budgets
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.8 }],

        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],

        // Resource budgets
        'resource-summary:document:size': ['warn', { maxNumericValue: 50000 }],
        'resource-summary:script:size': ['error', { maxNumericValue: 300000 }],
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 50000 }],
        'resource-summary:image:size': ['warn', { maxNumericValue: 200000 }],
        'resource-summary:font:size': ['warn', { maxNumericValue: 100000 }],

        // Other metrics
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'interactive': ['warn', { maxNumericValue: 3500 }],
        'uses-responsive-images': 'warn',
        'offscreen-images': 'warn',
        'uses-optimized-images': 'warn',
        'modern-image-formats': 'warn',
        'uses-text-compression': 'error',
        'uses-long-cache-ttl': 'warn',
      },
    },
  },
};

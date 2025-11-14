# Testing Guide

This project uses Vitest as the testing framework for unit, integration, and component tests.

## Setup

Install test dependencies:

```bash
npm install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test src/lib/security/__tests__/spam-prevention.test.ts
```

### Run tests matching a pattern
```bash
npm test -- --grep="Rate Limiting"
```

## Test Structure

```
src/
├── lib/
│   ├── security/
│   │   ├── spam-prevention.ts
│   │   └── __tests__/
│   │       └── spam-prevention.test.ts
│   └── features/
│       ├── feature-gate.ts
│       └── __tests__/
│           └── feature-gate.test.ts
└── app/
    └── api/
        └── reports/
            ├── route.ts
            └── __tests__/
                └── route.test.ts
```

## Writing Tests

### Unit Tests

Unit tests should be placed in `__tests__` directories next to the code they test.

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myFunction';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Integration Tests (API Routes)

API route tests should mock Supabase and test the full request/response cycle.

```typescript
import { describe, it, expect, vi } from 'vitest';
import { POST } from '../route';

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(() => mockSupabase),
}));

describe('POST /api/endpoint', () => {
  it('should return 200', async () => {
    const request = new Request('http://localhost/api/endpoint', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

### Component Tests

React component tests use React Testing Library.

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

## E2E Testing with Playwright

### Setup

Install Playwright (note: requires network access to npm registry):

```bash
npm install -D @playwright/test
npx playwright install
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run E2E tests in specific browser
npm run test:e2e:chromium

# View test report
npm run test:e2e:report
```

### E2E Test Structure

```
tests/
└── e2e/
    ├── auth.spec.ts           # Authentication flow tests
    ├── bookmarks.spec.ts      # Bookmark management tests
    ├── subscription.spec.ts   # Subscription/payment flow tests
    └── affiliate.spec.ts      # Affiliate link tests
```

### Writing E2E Tests

E2E tests simulate real user interactions with the application:

```typescript
import { test, expect } from '@playwright/test';

test('should create bookmark', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.goto('/dashboard/bookmarks');
  await page.click('button:has-text("Add")');
  await page.fill('input[name="url"]', 'https://example.com');
  await page.fill('input[name="title"]', 'Test Bookmark');
  await page.click('button[type="submit"]');

  await expect(page.locator('text=Test Bookmark')).toBeVisible();
});
```

### E2E Test Environment Variables

Create `.env.test.local` for test credentials:

```bash
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=your_test_password
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
```

### E2E Best Practices

1. **Use Data Attributes**: Add `data-testid` attributes for reliable selectors
2. **Isolate Tests**: Each test should be independent and set up its own state
3. **Clean Up**: Delete test data after tests complete
4. **Use Page Objects**: For complex flows, create page object models
5. **Handle Async**: Always await Playwright actions and assertions
6. **Test User Flows**: Focus on complete user journeys, not individual components
7. **Mock External Services**: Mock payment providers, email services, etc.

### Debugging E2E Tests

```bash
# Run with headed browser
npm run test:e2e:headed

# Run with debug mode (step through tests)
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run specific test by name
npx playwright test -g "should login with valid credentials"
```

## Test Coverage

We aim for:
- **80%+ coverage** for utility functions
- **70%+ coverage** for API routes
- **60%+ coverage** for components

View coverage report:
```bash
npm run test:coverage
```

Then open `coverage/index.html` in your browser.

## Mocking Guidelines

### Mocking Supabase

```typescript
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
};

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(() => mockSupabase),
}));
```

### Mocking Next.js Router

Already mocked in `vitest.setup.ts`. Use as needed:

```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/some-path'); // This is mocked
```

## Continuous Integration

Tests run automatically on:
- Every push to main branch
- Every pull request

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
2. **Keep Tests Simple**: One assertion per test when possible
3. **Use Descriptive Test Names**: `it('should return error when user is not authenticated')`
4. **Clean Up**: Use `beforeEach` and `afterEach` for setup and teardown
5. **Mock External Dependencies**: Don't make real API calls or database queries
6. **Test Edge Cases**: Consider null, undefined, empty arrays, large numbers, etc.
7. **Avoid Test Interdependence**: Each test should be independent

## Common Issues

### Test fails with "Cannot find module"

Make sure path aliases in `vitest.config.ts` match your `tsconfig.json`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

### Supabase mock not working

Ensure you're mocking the correct path (`@/lib/supabase/server` vs `@/lib/supabase/client`).

### Tests timing out

Increase timeout in specific tests:

```typescript
it('should handle long operation', async () => {
  // ...
}, 10000); // 10 second timeout
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

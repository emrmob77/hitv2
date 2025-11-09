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

# 🧪 Testing Guide - Instacione

This document outlines the testing setup and practices for the Instacione parking hub application.

## 🚀 Testing Stack

We use [Vitest](https://vitest.dev/) as our primary testing framework, which provides:

- **Fast execution** with Vite's native speed
- **Jest-compatible API** for easy migration
- **TypeScript support** out of the box
- **Built-in coverage reporting**
- **Watch mode** for development

### Additional Testing Tools

- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers for DOM elements
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM environment for testing
- **Husky** - Git hooks for automated testing
- **lint-staged** - Pre-commit linting and formatting

## 📁 Test Structure

```
src/
├── lib/
│   ├── __tests__/
│   │   ├── basic.test.ts          # Basic functionality tests
│   │   ├── utils.test.ts          # Utility function tests
│   │   ├── stripe.test.ts         # Stripe integration tests
│   │   └── email.test.ts          # Email service tests
├── components/
│   └── __tests__/
│       └── payment-form.test.tsx  # Component tests
├── app/
│   └── api/
│       └── __tests__/
│           └── reservations.test.ts # API route tests
└── test/
    └── setup.ts                   # Test configuration
```

## 🏃‍♂️ Running Tests

### Development Commands

```bash
# Run all tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm run test:run src/lib/__tests__/utils.test.ts
```

### Coverage Reports

Coverage reports are generated in multiple formats:
- **HTML**: `coverage/index.html` (interactive report)
- **LCOV**: `coverage/lcov.info` (for CI/CD)
- **Text**: Console output
- **JSON**: `coverage/coverage-final.json`

### Coverage Thresholds

We maintain the following coverage thresholds:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## 🔧 Test Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
})
```

### Test Setup (`src/test/setup.ts`)

The setup file configures:
- **Jest DOM matchers** for better assertions
- **Next.js mocks** for navigation and dynamic imports
- **Environment variables** for testing
- **Global cleanup** after each test

## 📝 Writing Tests

### Unit Tests

Test individual functions and utilities:

```typescript
import { describe, it, expect } from 'vitest'
import { formatAmount } from '../stripe'

describe('Stripe utilities', () => {
  it('should format amount in Brazilian Real', () => {
    const result = formatAmount(12.50)
    expect(result).toContain('R$')
    expect(result).toContain('12,50')
  })
})
```

### Component Tests

Test React components with user interactions:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('should handle click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await userEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

### API Route Tests

Test Next.js API routes:

```typescript
import { POST } from '../route'
import { NextRequest } from 'next/server'

describe('/api/reservations', () => {
  it('should create a reservation', async () => {
    const request = new NextRequest('http://localhost:3000/api/reservations', {
      method: 'POST',
      body: JSON.stringify({ lotId: 'lot_123', carPlate: 'ABC-1234' })
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
  })
})
```

## 🤖 Automated Testing

### Pre-commit Hooks

Tests run automatically before every commit:

```bash
# Pre-commit hook runs:
npm run test:run      # All tests
npm run type-check    # TypeScript checking
npm run lint          # ESLint
```

### CI/CD Pipeline

GitHub Actions workflow runs on every push and PR:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test:run

- name: Run tests with coverage
  run: npm run test:coverage
```

## 🎯 Testing Best Practices

### 1. Test Structure (AAA Pattern)

```typescript
it('should do something', () => {
  // Arrange - Set up test data
  const input = 'test input'
  
  // Act - Execute the function
  const result = functionUnderTest(input)
  
  // Assert - Verify the result
  expect(result).toBe('expected output')
})
```

### 2. Descriptive Test Names

```typescript
// ✅ Good
it('should format currency amount with Brazilian Real symbol')

// ❌ Bad
it('should work')
```

### 3. Test One Thing at a Time

```typescript
// ✅ Good - Each test has a single responsibility
it('should format positive amounts')
it('should format zero amounts')
it('should format negative amounts')

// ❌ Bad - Testing multiple scenarios
it('should format all types of amounts')
```

### 4. Use Appropriate Matchers

```typescript
// ✅ Good - Specific matchers
expect(result).toContain('R$')
expect(array).toHaveLength(3)
expect(object).toHaveProperty('id')

// ❌ Bad - Generic matchers
expect(result).toBeTruthy()
```

### 5. Mock External Dependencies

```typescript
// Mock external services
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    paymentIntents: {
      create: vi.fn()
    }
  }))
}))
```

## 🐛 Debugging Tests

### Running Single Tests

```bash
# Run specific test
npm run test:run -- --reporter=verbose src/lib/__tests__/utils.test.ts

# Run with debug output
npm run test:run -- --reporter=verbose --no-coverage
```

### Test UI

Launch the Vitest UI for interactive debugging:

```bash
npm run test:ui
```

### Coverage Analysis

```bash
# Generate and open coverage report
npm run test:coverage
open coverage/index.html
```

## 📊 Test Metrics

### Current Coverage

- **Utils**: 100%
- **Stripe**: 95%
- **Email**: 90%
- **Components**: 85%
- **API Routes**: 80%

### Test Performance

- **Unit Tests**: ~50ms per test
- **Integration Tests**: ~200ms per test
- **E2E Tests**: ~2s per test

## 🔄 Continuous Integration

Tests run automatically on:
- **Pull Requests** - Prevents merging broken code
- **Main Branch** - Ensures main branch stability
- **Scheduled** - Daily regression testing

### GitHub Actions

The CI pipeline includes:
1. **Node.js Setup** (18.x, 20.x)
2. **Dependency Installation**
3. **Type Checking**
4. **Linting**
5. **Test Execution**
6. **Coverage Reporting**
7. **Build Verification**

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Tests**
   ```bash
   npm test
   ```

3. **Write Your First Test**
   ```bash
   # Create a new test file
   touch src/lib/__tests__/my-function.test.ts
   ```

4. **Watch Tests During Development**
   ```bash
   npm run test:watch
   ```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Guide](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

**Happy Testing! 🧪✨**

Remember: Good tests are an investment in code quality and developer confidence. Write tests that are reliable, maintainable, and provide clear feedback when things break.

# Backend Testing Documentation

This directory contains the unit tests for the backend portion of the BnB ESGI project.

## Structure

The tests are organized to mirror the `src` directory:

- `services/`: Tests for application logic and database interactions.
- `middlewares/`: Tests for request processing and access control.
- `validations/`: Tests for Joi validation schemas.
- `types/`: Tests for custom error classes and shared types.

## Prerequisites

- Node.js installed
- Dependencies installed: `npm install`
- Prisma client generated: `npx prisma generate`

## Running Tests

- **All tests**: `npm test`
- **Watch mode**: `npm run test:watch`
- **With coverage**: `npm run test:coverage`
- **Specific test file**: `npx jest src/__tests__/path/to/test.ts`

## Mocking Strategy

- **Prisma**: We use `jest-mock-extended` to mock the Prisma client. The mock is initialized in `src/__tests__/setup.ts` and exported as `prismaMock`.
- **Environment Variables**: Some tests require specific environment variables (e.g., `GEMINI_API_KEY`). These are set manually in the test files when necessary.
- **External APIs**: Services using external APIs (like Gemini) are mocked to avoid network calls and costs.

## Best Practices

- Always use `prismaMock` for database interactions to maintain test isolation.
- Use `require()` for services that perform top-level side effects (like initializing API clients) after setting up environment variables.
- Ensure all mocks are cleared or restored in `beforeEach` or `afterEach` using `jest.clearAllMocks()` and `jest.restoreAllMocks()`.

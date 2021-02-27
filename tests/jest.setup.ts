import { server } from "#test_helpers/server";

// Setup the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers()); // Reset any test-specific handlers
afterAll(() => server.close());

// Mock functions missing from jsdom for tests that use the jsdom environment
if (typeof window !== "undefined") {
  window.scroll = jest.fn();
}

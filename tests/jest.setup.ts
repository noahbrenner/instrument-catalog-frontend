import { server } from "#test_helpers/server";

// Setup the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers()); // Reset any test-specific handlers
afterAll(() => server.close());

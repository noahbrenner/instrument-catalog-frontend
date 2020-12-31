import { setupServer } from "msw/node";

import { handlers } from "#server_routes.mock";

export { rest } from "msw";
export { ENDPOINTS, MOCK_DATA } from "#server_routes.mock";
export const server = setupServer(...handlers);

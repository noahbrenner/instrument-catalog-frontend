import { rest } from "msw";
import { setupServer } from "msw/node";

import { handlers, ENDPOINTS, HEADERS, MOCK_DATA } from "#server_routes.mock";

const server = setupServer(...handlers);
export { rest, server, ENDPOINTS, HEADERS, MOCK_DATA };

// This file is only used in development and *should* live with the other mocks,
// but the build system will silently fail to import it in the development build
// if it's outside the src/ directory

// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";
import type { RequestHandler } from "msw";

const { API_ROOT } = process.env;

export const ENDPOINTS = {
  users: `${API_ROOT}/users/all`,
} as const;

export const MOCK_DATA = {
  users: [
    { name: "Frida Permissions", id: 777 },
    { name: "Nonny Mouse", id: 1337 },
    { name: "No Body", id: 12345 },
  ],
} as const;

export const HEADERS: Record<string, string | string[]> = {
  "Access-Control-Allow-Origin": "*",
} as const;

export const handlers: RequestHandler[] = [
  rest.get(ENDPOINTS.users, (_req, res, ctx) => {
    const { users } = MOCK_DATA;
    return res(ctx.set(HEADERS), ctx.json({ users }));
  }),
];

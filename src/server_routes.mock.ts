// This file is only used in development and *should* live with the other mocks,
// but the build system will silently fail to import it in the development build
// if it's outside the src/ directory

// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";
import type { RequestHandler } from "msw";

import { ENDPOINTS } from "./api_endpoints";
import type { ICategory, IUser } from "./types";

export { ENDPOINTS };

export const MOCK_DATA = {
  categories: [
    {
      name: "Winds",
      itemCount: 3,
      summary: "Move air, make noise",
      description: "This is a longer description of wind instruments.",
    },
    {
      name: "Percussion",
      itemCount: 300,
      summary: "Hit stuff",
      description: "This is a longer description of percussion instruments.",
    },
    {
      name: "Strings",
      itemCount: 72,
      summary: "Wobbling cords",
      description: "This is a longer description of stringed instruments.",
    },
  ] as ICategory[],
  users: [
    { name: "Frida Permissions", id: 777 },
    { name: "Nonny Mouse", id: 1337 },
    { name: "No Body", id: 12345 },
  ] as IUser[],
} as const;

export const HEADERS: Record<string, string | string[]> = {
  "Access-Control-Allow-Origin": "*",
} as const;

export const handlers: RequestHandler[] = [
  // Create a handler for each top level MOCK_DATA key; The handler for
  // a given key uses the URL defined in ENDPOINTS under the same key
  ...Object.keys(MOCK_DATA).map((key: keyof typeof MOCK_DATA) => {
    return rest.get(ENDPOINTS[key], (_req, res, ctx) => {
      return res(ctx.set(HEADERS), ctx.json({ [key]: MOCK_DATA[key] }));
    });
  }),
];

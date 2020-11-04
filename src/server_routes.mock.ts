/*
 * This file is only used in development and *should* live in `tests/mocks/`,
 * but the build system would silently fail to import it in the development
 * build if it's outside the `src/` directory
 */

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
      slug: "winds",
      itemCount: 3,
      summary: "Move air, make noise",
      description: "This is a longer description of wind instruments.",
    },
    {
      name: "Percussion",
      slug: "percussion",
      itemCount: 300,
      summary: "Hit stuff",
      description: "This is a longer description of percussion instruments.",
    },
    {
      name: "Strings",
      slug: "strings",
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

/*
 * The RequestHandler type needs `any` so handlers can have different responses:
 * https://github.com/mswjs/msw/issues/377#issuecomment-690536532
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handlers: RequestHandler<any, any, any, any>[] = [
  // Create a handler for each top level MOCK_DATA key; The handler for
  // a given key uses the URL defined in ENDPOINTS under the same key
  ...(Object.keys(MOCK_DATA) as Array<keyof typeof MOCK_DATA>).map((key) => {
    return rest.get(ENDPOINTS[key], (_req, res, ctx) => {
      return res(ctx.set(HEADERS), ctx.json({ [key]: MOCK_DATA[key] }));
    });
  }),

  /** Handle: /category?slug=<lowercase-category-name> */
  rest.get(ENDPOINTS.category, (req, res, ctx) => {
    const category = MOCK_DATA.categories.find(
      ({ slug }) => slug === req.url.searchParams.get("slug")
    );
    return category
      ? res(ctx.set(HEADERS), ctx.json(category))
      : res(ctx.set(HEADERS), ctx.status(404));
  }),
];

import {
  rest,
  server,
  ENDPOINTS,
  HEADERS,
  MOCK_DATA,
} from "#test_helpers/server";
import { api } from "#api";
import type { APIError } from "#api";

const { categories, instruments, users } = MOCK_DATA;

type MethodTestSpec = readonly [
  method: keyof typeof api,
  endpoint: string,
  methodArgs: readonly unknown[],
  expected: unknown
];

const HTTP_GET_ENDPOINTS: readonly MethodTestSpec[] = [
  ["getCategories", ENDPOINTS.categories, [], { categories }],
  [
    "getCategoryBySlug",
    `${ENDPOINTS.categories}/winds`,
    ["winds"],
    categories.find(({ slug }) => slug === "winds"),
  ],
  ["getInstruments", ENDPOINTS.instruments, [], { instruments }],
  [
    "getInstrumentsByCategoryId",
    ENDPOINTS.instruments,
    [1],
    { instruments: instruments.filter(({ categoryId }) => categoryId === 1) },
  ],
  ["getUsers", ENDPOINTS.users, [], { users }],
];

describe("api", () => {
  describe("given a successful API response", () => {
    test.each(HTTP_GET_ENDPOINTS)(
      '.%s() returns "%s" data',
      async (method, _endpoint, args, expected) => {
        // @ts-expect-error -- `args` may have different length/types
        const result = await api[method](...args);
        expect(result).not.toHaveProperty("uiErrorMessage");
        expect(result.data).toStrictEqual(expected);
      }
    );
  });

  describe("given a network error", () => {
    test.each(HTTP_GET_ENDPOINTS)(
      ".%s() returns a network error message if the error is persistent",
      (method, endpoint, args) => {
        server.use(
          rest.get(endpoint, (_req, res) => {
            return res.networkError("Failed to connect");
          })
        );

        expect.assertions(1);

        // @ts-expect-error -- `args` may have different length/types
        return (api[method](...args) as Promise<unknown>).catch(
          (err: APIError) => {
            expect(err.uiErrorMessage).toStrictEqual(
              "Couldn't reach the server. Please try reloading in a minute."
            );
          }
        );
      }
    );

    // TODO Enable this test (remove `.skip`) when it's possible to implement it
    test.skip.each(HTTP_GET_ENDPOINTS)(
      ".%s() retries the request",
      async (method, endpoint, args, expected) => {
        server.use(
          rest.get(endpoint, (_req, res) => {
            // TODO Return a NetworkError one time (the API doesn't exist yet):
            // https://github.com/mswjs/msw/issues/413
            return res.once(/* Do something */);
          })
        );

        expect.assertions(1);

        try {
          // @ts-expect-error -- `args` may have different length/types
          const { data } = await api[method](...args);
          expect(data).toStrictEqual(expected);
        } catch (err) {
          expect(err).not.toBeDefined();
        }
      }
    );
  });

  describe("given a 500 status code", () => {
    test.each(HTTP_GET_ENDPOINTS)(
      ".%s() returns a status error message if the error is persistent",
      (method, endpoint, args) => {
        server.use(
          rest.get(endpoint, (_req, res, ctx) => {
            return res(ctx.set(HEADERS), ctx.status(500, "My Error"));
          })
        );

        expect.assertions(1);
        // @ts-expect-error -- `args` may have different length/types
        return (api[method](...args) as Promise<unknown>).catch(
          (err: APIError) => {
            expect(err.uiErrorMessage).toStrictEqual(
              'Error from server: "500 My Error". Please send a bug report!'
            );
          }
        );
      }
    );

    test.each(HTTP_GET_ENDPOINTS)(
      ".%s() retries the request",
      async (method, endpoint, args, expected) => {
        server.use(
          rest.get(endpoint, (_req, res, ctx) => {
            return res.once(ctx.set(HEADERS), ctx.status(500, "My Error"));
          })
        );

        expect.assertions(1);

        try {
          // @ts-expect-error -- `args` may have different length/types
          const { data } = await api[method](...args);
          expect(data).toStrictEqual(expected);
        } catch (err) {
          expect(err).not.toBeDefined();
        }
      }
    );
  });

  describe("given a 400 status code and a JSON error message", () => {
    test.each(HTTP_GET_ENDPOINTS)(
      ".%s() returns a status error message including the JSON error message",
      (method, endpoint, args) => {
        server.use(
          rest.get(endpoint, (_req, res, ctx) => {
            return res(
              ctx.set(HEADERS),
              ctx.status(400, "My Error"),
              ctx.json({ error: "My Special Error" })
            );
          })
        );

        expect.assertions(1);
        // @ts-expect-error -- `args` may have different length/types
        return (api[method](...args) as Promise<unknown>).catch(
          (err: APIError) => {
            expect(err.uiErrorMessage).toStrictEqual(
              'Error from server: "400 My Error". My Special Error'
            );
          }
        );
      }
    );
  });

  /*
   * NOTE: We're not testing `errorHandler()`'s "Unknown error" branch.
   *
   * I'm not sure how to trigger that branch with real request behavior. If I
   * knew, it wouldn't be an unknown error and we could provide a better
   * message. We could unit test `errorHandler()` with an object lacking
   * `.response` and `.request`, but that would just be testing JavaScript's
   * `else` keyword, it wouldn't provide any confidence about app behavior.
   */
});

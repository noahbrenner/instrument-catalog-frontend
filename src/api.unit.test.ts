import {
  rest,
  server,
  ENDPOINTS,
  HEADERS,
  MOCK_DATA,
} from "#test_helpers/server";
import { api } from "#api";
import type { APIError } from "#api";

type MethodTestSpec = readonly [
  method: keyof typeof api,
  endpoint: keyof typeof ENDPOINTS,
  dataKey: keyof typeof MOCK_DATA
];

const HTTP_GET_ENDPOINTS: readonly MethodTestSpec[] = [
  ["getCategories", "categories", "categories"],
  ["getUsers", "users", "users"],
];

describe("api", () => {
  describe("given a successful API response", () => {
    test.each(HTTP_GET_ENDPOINTS)(
      '.%s() returns "%s" data',
      async (method, _endpoint, dataKey) => {
        const result = await api[method]();
        expect(result).not.toHaveProperty("uiErrorMessage");
        expect(result.data).toStrictEqual({ [dataKey]: MOCK_DATA[dataKey] });
      }
    );
  });

  describe("given a network error", () => {
    test.each(HTTP_GET_ENDPOINTS)(
      ".%s() returns a network error message if the error is persistent",
      (method, endpoint) => {
        server.use(
          rest.get(ENDPOINTS[endpoint], (_req, res) => {
            return res.networkError("Failed to connect");
          })
        );

        expect.assertions(1);

        return (api[method]() as Promise<unknown>).catch((err: APIError) => {
          expect(err.uiErrorMessage).toStrictEqual(
            "Couldn't reach the server. Please try reloading in a minute."
          );
        });
      }
    );

    // TODO Enable this test (remove `.skip`) when it's possible to implement it
    test.skip.each(HTTP_GET_ENDPOINTS)(
      ".%s() retries the request",
      async (method, endpoint, dataKey) => {
        server.use(
          rest.get(ENDPOINTS[endpoint], (_req, res) => {
            // TODO Return a NetworkError one time (the API doesn't exist yet):
            // https://github.com/mswjs/msw/issues/413
            return res.once(/* Do something */);
          })
        );

        expect.assertions(1);

        try {
          const { data } = await api[method]();
          expect(data).toStrictEqual({ [dataKey]: MOCK_DATA[dataKey] });
        } catch (err) {
          expect(err).not.toBeDefined();
        }
      }
    );
  });

  describe("given a 500 status code", () => {
    test.each(HTTP_GET_ENDPOINTS)(
      ".%s() returns a status error message if the error is persistent",
      (method, endpoint) => {
        server.use(
          rest.get(ENDPOINTS[endpoint], (_req, res, ctx) => {
            return res(ctx.set(HEADERS), ctx.status(500, "My Error"));
          })
        );

        expect.assertions(1);
        return (api[method]() as Promise<unknown>).catch((err: APIError) => {
          expect(err.uiErrorMessage).toStrictEqual(
            'Error from server: "500 My Error". Please send a bug report!'
          );
        });
      }
    );

    test.each(HTTP_GET_ENDPOINTS)(
      ".%s() retries the request",
      async (method, endpoint, dataKey) => {
        server.use(
          rest.get(ENDPOINTS[endpoint], (_req, res, ctx) => {
            return res.once(ctx.set(HEADERS), ctx.status(500, "My Error"));
          })
        );

        expect.assertions(1);

        try {
          const { data } = await api[method]();
          expect(data).toStrictEqual({ [dataKey]: MOCK_DATA[dataKey] });
        } catch (err) {
          expect(err).not.toBeDefined();
        }
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

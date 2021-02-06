/** @jest-environment node */
import { OAuthError } from "@auth0/auth0-react";
import type { ResponseResolver } from "msw";

import { rest, server, MOCK_DATA } from "#test_helpers/server";
import {
  baseRequest,
  baseAuthenticatedRequest,
  getCategories,
  getCategoryBySlug,
  getInstruments,
  getInstrumentsByCategoryId,
  getInstrumentById,
} from "#api";
import type { APIHandlers, APIUtils, RequestParams } from "#api";

const { API_ROOT } = process.env;

describe("baseRequest()", () => {
  function callBaseRequest(params: RequestParams) {
    const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
    const { cancel, completed } = baseRequest(handlers, params);
    return { ...handlers, cancel, completed };
  }

  describe("given a successful API response", () => {
    it("calls onSuccess() with the response data", async () => {
      const url = `${API_ROOT}/api-test`;
      server.use(
        rest.get(url, (_req, res, ctx) => {
          return res(ctx.json({ foo: "bar" }));
        })
      );
      const request = callBaseRequest({ method: "GET", url });
      await request.completed;

      expect(request.onSuccess).toBeCalledWith({ foo: "bar" });
      expect(request.onError).not.toBeCalled();
    });
  });

  describe("given a call to cancel() before the request completes", () => {
    it("does not call onSuccess() or onError()", async () => {
      const url = `${API_ROOT}/api-test`;
      server.use(
        rest.get(url, (_req, res, ctx) => {
          return res(ctx.json({ foo: "bar" }));
        })
      );
      const request = callBaseRequest({ method: "GET", url });
      request.cancel();
      await request.completed;

      expect(request.onSuccess).not.toBeCalled();
      expect(request.onError).not.toBeCalled();
    });
  });

  describe("given a call to cancel() after the request completes", () => {
    it("calling cancel() does not throw", async () => {
      const url = `${API_ROOT}/api-test`;
      server.use(
        rest.get(url, (_req, res, ctx) => {
          return res(ctx.json({ foo: "bar" }));
        })
      );
      const request = callBaseRequest({ method: "GET", url });
      await request.completed;

      expect(() => request.cancel()).not.toThrow();
      expect(request.onSuccess).toBeCalledWith({ foo: "bar" });
      expect(request.onError).not.toBeCalled();
    });
  });

  describe("given a network error", () => {
    it("calls onError() with a network error message if the error is persistent", async () => {
      const url = `${API_ROOT}/api-test`;
      server.use(
        rest.get(url, (_req, res) => {
          return res.networkError("Failed to connect");
        })
      );
      const request = callBaseRequest({ method: "GET", url });
      await request.completed;

      expect(request.onSuccess).not.toBeCalled();
      expect(request.onError).toBeCalledTimes(1);

      const [uiErrorMessage] = request.onError.mock.calls[0];
      expect(uiErrorMessage).toStrictEqual(
        "Couldn't reach the server. Please try reloading in a minute."
      );
    });

    it("retries the request", async () => {
      const url = `${API_ROOT}/api-test`;
      // TODO Use a builtin msw method to return a NetworkError once, after msw
      // implements such a method -- https://github.com/mswjs/msw/issues/413
      // For now, this workaround does the trick
      function enableSuccessfulApiResponse() {
        server.use(
          rest.get(url, (_req, res, ctx) => {
            return res(ctx.json({ foo: "bar" }));
          })
        );
      }
      server.use(
        rest.get(url, (_req, res) => {
          enableSuccessfulApiResponse();
          return res.networkError("Failed to connect");
        })
      );
      const request = callBaseRequest({ method: "GET", url });
      await request.completed;

      // console.log(request.onError.mock.calls[0][1].toJSON());
      expect(request.onError).not.toBeCalled();
      expect(request.onSuccess).toBeCalledWith({ foo: "bar" });
    });
  });

  describe("given a 500 status code", () => {
    it("calls onError() with a status error message if the error is persistent", async () => {
      const url = `${API_ROOT}/api-test`;
      server.use(
        rest.get(url, (_req, res, ctx) => {
          return res(ctx.status(500, "My Error"));
        })
      );
      const request = callBaseRequest({ method: "GET", url });
      await request.completed;

      expect(request.onSuccess).not.toBeCalled();
      expect(request.onError).toBeCalledTimes(1);

      const [uiErrorMessage] = request.onError.mock.calls[0];
      expect(uiErrorMessage).toStrictEqual(
        'Error from server: "500 My Error". Please send a bug report!'
      );
    });

    it("retries the request", async () => {
      const url = `${API_ROOT}/api-test`;
      server.use(
        // Return a 500 status once
        rest.get(url, (_req, res, ctx) => {
          return res.once(ctx.status(500, "My Error"));
        }),
        // Then return a successful response
        rest.get(url, (_req, res, ctx) => {
          return res(ctx.json({ foo: "bar" }));
        })
      );
      const request = callBaseRequest({ method: "GET", url });
      await request.completed;

      expect(request.onSuccess).toBeCalledWith({ foo: "bar" });
      expect(request.onError).not.toBeCalled();
    });
  });

  describe("given a 400 status code and a JSON error message", () => {
    it("calls onError() with a status error message including the JSON message", async () => {
      const url = `${API_ROOT}/api-test`;
      server.use(
        rest.get(url, (_req, res, ctx) => {
          return res(
            ctx.status(400, "My Error"),
            ctx.json({ error: "My Special Error" })
          );
        })
      );
      const request = callBaseRequest({ method: "GET", url });
      await request.completed;

      expect(request.onSuccess).not.toBeCalled();
      expect(request.onError).toBeCalledTimes(1);

      const [uiErrorMessage] = request.onError.mock.calls[0];
      expect(uiErrorMessage).toStrictEqual(
        'Error from server: "400 My Error". My Special Error'
      );
    });

    it("does not retry the request", async () => {
      const url = `${API_ROOT}/api-test`;
      server.use(
        // Return a 400 status once
        rest.get(url, (_req, res, ctx) => {
          return res.once(
            ctx.status(400, "My Error"),
            ctx.json({ error: "My Special Error" })
          );
        }),
        // Then return a successful response
        rest.get(url, (_req, res, ctx) => {
          return res(ctx.json({ foo: "bar" }));
        })
      );
      const request = callBaseRequest({ method: "GET", url });
      await request.completed;

      expect(request.onSuccess).not.toBeCalled();
      expect(request.onError).toBeCalledTimes(1);

      const [uiErrorMessage] = request.onError.mock.calls[0];
      expect(uiErrorMessage).toStrictEqual(
        'Error from server: "400 My Error". My Special Error'
      );
    });
  });

  /*
   * NOTE: We're not testing `getUiErrorMessage()`'s "Unknown error" branch.
   *
   * I'm not sure how to trigger that branch with real request behavior. If I
   * knew, it wouldn't be an unknown error and we could provide a better
   * message. We *could* unit test `getUiErrorMessage()` with an object lacking
   * `.response` and `.request`, but that would just be testing JavaScript's
   * `else` keyword, it wouldn't provide any confidence about app behavior.
   */
});

describe("baseAuthenticatedRequest()", () => {
  const ACCESS_TOKEN = "myM0ckacc3s570ken";
  const getAccessTokenSilently = jest.fn(() => Promise.resolve(ACCESS_TOKEN));
  function callBaseAuthenticatedRequest(
    params: Omit<RequestParams, "url">,
    resolver: ResponseResolver
  ) {
    const handlers = { onSuccess: jest.fn(), onError: jest.fn() };

    const url = `${API_ROOT}/api-test`;
    const method = params.method.toLowerCase() as keyof typeof rest;
    const mockedResolver = jest.fn(resolver);
    const serverCalls = mockedResolver.mock.calls;
    server.use(rest[method](url, mockedResolver));

    const allRequestParams = { ...params, url };
    const { cancel, completed } = baseAuthenticatedRequest(
      getAccessTokenSilently,
      handlers,
      allRequestParams
    );
    return { ...handlers, cancel, completed, serverCalls };
  }

  describe("given a request happy path", () => {
    it.each(["DELETE", "POST", "PUT"] as const)(
      "adds the correct Authorization header when sending a %s request",
      async (method) => {
        const request = callBaseAuthenticatedRequest(
          { method, data: { foo: "bar" } },
          (_req, res, ctx) => res(ctx.status(200))
        );
        await request.completed;
        const [req] = request.serverCalls[0];

        expect(req.headers.get("Authorization")).toBe(`Bearer ${ACCESS_TOKEN}`);
        expect(req.body).toEqual({ foo: "bar" });
        expect(request.onSuccess).toBeCalled();
        expect(request.onError).not.toBeCalled();
      }
    );
  });

  describe("given an immediately cancelled request", () => {
    it("the request is never sent to the server", async () => {
      const request = callBaseAuthenticatedRequest(
        { method: "POST", data: { foo: "bar" } },
        (_req, res, ctx) => res(ctx.status(200))
      );
      request.cancel();
      await request.completed;

      expect(request.serverCalls).toHaveLength(0);
      expect(request.onSuccess).not.toBeCalled();
      expect(request.onError).not.toBeCalled();
    });
  });

  describe("given a request cancelled after being sent to the server", () => {
    it("the request is submitted, but neither callback is called", async () => {
      const request = callBaseAuthenticatedRequest(
        { method: "POST", data: { foo: "bar" } },
        (_req, res, ctx) => {
          request.cancel();
          return res(ctx.status(200));
        }
      );
      await request.completed;
      const [req] = request.serverCalls[0];

      expect(request.serverCalls).toHaveLength(1);
      expect(req.body).toEqual({ foo: "bar" });
      expect(request.onSuccess).not.toBeCalled();
      expect(request.onError).not.toBeCalled();
    });
  });

  describe("given an authentication error", () => {
    it("calls onError() with an authentication error message", async () => {
      getAccessTokenSilently.mockReturnValueOnce(
        Promise.reject(new OAuthError("auth_error"))
      );
      const request = callBaseAuthenticatedRequest(
        { method: "POST", data: { foo: "bar" } },
        (_req, res, ctx) => res(ctx.status(200))
      );
      await request.completed;

      expect(request.serverCalls).toHaveLength(0);
      expect(request.onSuccess).not.toBeCalled();
      expect(request.onError).toBeCalledTimes(1);

      const [uiErrorMessage] = request.onError.mock.calls[0];
      expect(uiErrorMessage).toMatch(
        /error authenticating your request: "auth_error"/i
      );
    });
  });

  describe("given a temporary 500 server error", () => {
    it.each(["DELETE", "PUT"] as const)(
      "retries a %s request",
      async (method) => {
        let isFirstRequest = true;
        const request = callBaseAuthenticatedRequest(
          { method, data: { foo: "bar" } },
          (_req, res, ctx) => {
            const status = isFirstRequest ? 500 : 200;
            isFirstRequest = false;
            return res(ctx.status(status));
          }
        );
        await request.completed;

        expect(request.serverCalls).toHaveLength(2);
        expect(request.onSuccess).toBeCalled();
        expect(request.onError).not.toBeCalled();
      }
    );

    it("does not retry a POST request", async () => {
      let isFirstRequest = true;
      const request = callBaseAuthenticatedRequest(
        { method: "POST", data: { foo: "bar" } },
        (_req, res, ctx) => {
          const status = isFirstRequest ? 500 : 200;
          isFirstRequest = false;
          return res(ctx.status(status));
        }
      );
      await request.completed;

      expect(request.serverCalls).toHaveLength(1);
      expect(request.onSuccess).not.toBeCalled();
      expect(request.onError).toBeCalled();
    });
  });
});

const apiFunctions: [string, (handlers: APIHandlers<unknown>) => APIUtils][] = [
  ["getCategories", (handlers) => getCategories(handlers)],
  ["getCategoryBySlug", (handlers) => getCategoryBySlug("strings", handlers)],
  ["getInstruments", (handlers) => getInstruments(handlers)],
  [
    "getInstrumentsByCategoryId",
    (handlers) => getInstrumentsByCategoryId(2, handlers),
  ],
  ["getInstrumentById", (handlers) => getInstrumentById(4, handlers)],
];

describe("API functions", () => {
  describe("given a 400 status code", () => {
    test.each(apiFunctions)(
      "%s() calls onError() with a status error message",
      async (_name, fn) => {
        server.use(
          rest.get(`${API_ROOT}/*`, (_req, res, ctx) => {
            return res.once(
              ctx.status(400, "Status Error"),
              ctx.json({ error: "JSON Error" })
            );
          })
        );
        const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
        const { completed } = fn(handlers);
        await completed;

        expect(handlers.onSuccess).not.toBeCalled();
        expect(handlers.onError).toBeCalledTimes(1);

        const [uiErrorMessage] = handlers.onError.mock.calls[0];
        expect(uiErrorMessage).toStrictEqual(
          'Error from server: "400 Status Error". JSON Error'
        );
      }
    );
  });

  describe("given a call to cancel() before the request completes", () => {
    test.each(apiFunctions)(
      "%s() does not call onSuccess() or onError()",
      async (_name, fn) => {
        const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
        const { cancel, completed } = fn(handlers);
        cancel();
        await completed;

        expect(handlers.onSuccess).not.toBeCalled();
        expect(handlers.onError).not.toBeCalled();
      }
    );
  });
});

describe("getCategories()", () => {
  describe("given a successful API response", () => {
    it("calls onSuccess() with the expected data", async () => {
      const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
      const { completed } = getCategories(handlers);
      await completed;

      const { categories } = MOCK_DATA;
      expect(handlers.onSuccess).toBeCalledWith({ categories });
      expect(handlers.onError).not.toBeCalled();
    });
  });
});

describe("getCategoryBySlug()", () => {
  describe("given an existing category's slug", () => {
    it.each(["strings", "winds"])(
      'calls onSuccess() with the expected data for category "%s"',
      async (categorySlug) => {
        const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
        const request = getCategoryBySlug(categorySlug, handlers);
        await request.completed;

        const category = MOCK_DATA.categories.find(
          ({ slug }) => slug === categorySlug
        );
        expect(category).not.toEqual(undefined);
        expect(handlers.onSuccess).toBeCalledWith(category);
        expect(handlers.onError).not.toBeCalled();
      }
    );
  });

  describe("given a non-existent category name", () => {
    it("calls onError() with a 404 error message", async () => {
      const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
      const { completed } = getCategoryBySlug("not-a-thing", handlers);
      await completed;

      expect(handlers.onSuccess).not.toBeCalled();
      expect(handlers.onError).toBeCalledTimes(1);

      const [uiErrorMessage, error] = handlers.onError.mock
        .calls[0] as Parameters<APIHandlers<unknown>["onError"]>;
      expect(uiErrorMessage).toMatch(/Error from server: "404/);
      expect(error.response?.status).toStrictEqual(404);
    });
  });

  describe("given an empty string", () => {
    it("calls onError() with an error message", async () => {
      const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
      const { completed } = getCategoryBySlug("", handlers);
      await completed;

      expect(handlers.onSuccess).not.toBeCalled();
      expect(handlers.onError).toBeCalledTimes(1);

      const [uiErrorMessage] = handlers.onError.mock.calls[0] as Parameters<
        APIHandlers<unknown>["onError"]
      >;
      expect(uiErrorMessage).toMatch(/Error from server/);
    });
  });
});

describe("getInstruments()", () => {
  describe("given a successful API response", () => {
    it("calls onSuccess() with the expected data", async () => {
      const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
      const { completed } = getInstruments(handlers);
      await completed;

      const { instruments } = MOCK_DATA;
      expect(handlers.onSuccess).toBeCalledWith({ instruments });
      expect(handlers.onError).not.toBeCalled();
    });
  });
});

describe("getInstrumentsByCategoryId()", () => {
  describe("given an existing category ID", () => {
    it.each([0, 2])(
      "calls onSuccess() with the expected data for ID %d",
      async (id) => {
        const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
        const request = getInstrumentsByCategoryId(id, handlers);
        await request.completed;

        const instruments = MOCK_DATA.instruments.filter(
          ({ categoryId }) => categoryId === id
        );
        expect(handlers.onSuccess).toBeCalledWith({ instruments });
        expect(handlers.onError).not.toBeCalled();
      }
    );
  });

  describe("given a non-existent category ID", () => {
    it("calls onSuccess() with an empty array of instruments", async () => {
      const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
      const { completed } = getInstrumentsByCategoryId(9001, handlers);
      await completed;

      expect(handlers.onSuccess).toBeCalledWith({ instruments: [] });
      expect(handlers.onError).not.toBeCalled();
    });
  });

  describe("given an invalid category ID", () => {
    it.each([-1, 1.1, NaN, Infinity])(
      "calls onError() with an error message for ID %d",
      async (id) => {
        const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
        const { completed } = getInstrumentsByCategoryId(id, handlers);
        await completed;

        expect(handlers.onSuccess).not.toBeCalled();
        expect(handlers.onError).toBeCalledTimes(1);

        const [uiErrorMessage] = handlers.onError.mock.calls[0];
        expect(uiErrorMessage).toMatch(/Error from server/);
      }
    );
  });
});

describe("getInstrumentById()", () => {
  describe("given an existing ID", () => {
    it.each([0, 4])(
      "calls onSuccess() with the expected data for ID %d",
      async (instrumentId) => {
        const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
        const request = getInstrumentById(instrumentId, handlers);
        await request.completed;

        const instrument = MOCK_DATA.instruments.find(
          ({ id }) => id === instrumentId
        );
        expect(instrument).not.toEqual(undefined);
        expect(handlers.onSuccess).toBeCalledWith(instrument);
        expect(handlers.onError).not.toBeCalled();
      }
    );
  });

  describe("given a non-existent ID", () => {
    it("calls onError() with a 404 error message", async () => {
      const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
      const { completed } = getInstrumentById(1337, handlers);
      await completed;

      expect(handlers.onSuccess).not.toBeCalled();
      expect(handlers.onError).toBeCalledTimes(1);

      const [uiErrorMessage, error] = handlers.onError.mock
        .calls[0] as Parameters<APIHandlers<unknown>["onError"]>;
      expect(uiErrorMessage).toMatch(/Error from server: "404/);
      expect(error.response?.status).toStrictEqual(404);
    });
  });

  describe("given an invalid ID", () => {
    it.each([-1, 1.1, NaN, Infinity])(
      "calls onError() with an error message for ID %d",
      async (id) => {
        const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
        const { completed } = getInstrumentById(id, handlers);
        await completed;

        expect(handlers.onSuccess).not.toBeCalled();
        expect(handlers.onError).toBeCalledTimes(1);

        const [uiErrorMessage] = handlers.onError.mock.calls[0];
        expect(uiErrorMessage).toMatch(/Error from server/);
      }
    );
  });
});

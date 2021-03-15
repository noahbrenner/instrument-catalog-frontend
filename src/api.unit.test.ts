/** @jest-environment node */
import { OAuthError } from "@auth0/auth0-react";
import jws from "jws";
import type { MockedRequest, ResponseResolver, restContext } from "msw";

import { rest, server, MOCK_DATA } from "#test_helpers/server";
import {
  baseRequest,
  baseAuthenticatedRequest,
  getCategories,
  getCategoryBySlug,
  getInstruments,
  getInstrumentsByCategoryId,
  getInstrumentById,
  createInstrument,
  updateInstrument,
  deleteInstrument,
} from "#api";
import type { APIHandlers, APIUtils, RequestParams } from "#api";

type OnErrorParams = Parameters<APIHandlers<unknown>["onError"]>;

const { API_ROOT } = process.env;

describe("baseRequest()", () => {
  function callBaseRequest(
    responseResolver: ResponseResolver<MockedRequest, typeof restContext>
  ) {
    const url = `${API_ROOT}/api-test`;
    const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
    const requestParams: RequestParams = { method: "GET", url };

    server.use(rest.get(url, responseResolver));
    const { cancel, completed } = baseRequest(handlers, requestParams);
    return { ...handlers, cancel, completed };
  }

  describe("given a successful API response", () => {
    it("calls onSuccess() with the response data", async () => {
      const request = callBaseRequest((_req, res, ctx) => {
        return res(ctx.json({ foo: "bar" }));
      });
      await request.completed;

      expect(request.onSuccess).toBeCalledWith({ foo: "bar" });
      expect(request.onError).not.toBeCalled();
    });
  });

  describe("given a call to cancel() before the request completes", () => {
    it("does not call onSuccess() or onError()", async () => {
      const request = callBaseRequest((_req, res, ctx) => {
        return res(ctx.json({ foo: "bar" }));
      });
      request.cancel();
      await request.completed;

      expect(request.onSuccess).not.toBeCalled();
      expect(request.onError).not.toBeCalled();
    });
  });

  describe("given a call to cancel() after the request completes", () => {
    it("calling cancel() does not throw", async () => {
      const request = callBaseRequest((_req, res, ctx) => {
        return res(ctx.json({ foo: "bar" }));
      });
      await request.completed;

      expect(() => request.cancel()).not.toThrow();
      expect(request.onSuccess).toBeCalledWith({ foo: "bar" });
      expect(request.onError).not.toBeCalled();
    });
  });

  describe("given a network error", () => {
    it("calls onError() with a network error message if the error is persistent", async () => {
      const request = callBaseRequest((_req, res) => {
        return res.networkError("Failed to connect");
      });
      await request.completed;

      expect(request.onSuccess).not.toBeCalled();
      expect(request.onError).toBeCalledTimes(1);

      const [uiErrorMessage] = request.onError.mock.calls[0];
      expect(uiErrorMessage).toStrictEqual(
        "Couldn't reach the server. Please try reloading in a minute."
      );
    });

    it("retries the request", async () => {
      let isFirstRequest = true;
      const request = callBaseRequest((_req, res, ctx) => {
        if (isFirstRequest) {
          isFirstRequest = false;
          // res.networkError() is currently implemented by throwing an error,
          return res.networkError("Failed to connect");
        }
        return res(ctx.json({ foo: "bar" }));
      });
      await request.completed;

      expect(request.onError).not.toBeCalled();
      expect(request.onSuccess).toBeCalledWith({ foo: "bar" });
    });
  });

  describe("given a 500 status code", () => {
    it("calls onError() with a status error message if the error is persistent", async () => {
      const request = callBaseRequest((_req, res, ctx) => {
        return res(ctx.status(500, "My Error"));
      });
      await request.completed;

      expect(request.onSuccess).not.toBeCalled();
      expect(request.onError).toBeCalledTimes(1);

      const [uiErrorMessage] = request.onError.mock.calls[0];
      expect(uiErrorMessage).toStrictEqual(
        'Error from server: "500 My Error". Please send a bug report!'
      );
    });

    it("retries the request", async () => {
      let isFirstRequest = true;
      const request = callBaseRequest((_req, res, ctx) => {
        if (isFirstRequest) {
          isFirstRequest = false;
          return res(ctx.status(500, "My Error"));
        }
        return res(ctx.json({ foo: "bar" }));
      });
      await request.completed;

      expect(request.onSuccess).toBeCalledWith({ foo: "bar" });
      expect(request.onError).not.toBeCalled();
    });
  });

  describe("given a 400 status code and a JSON error message", () => {
    it("calls onError() with a status error message including the JSON message", async () => {
      const request = callBaseRequest((_req, res, ctx) => {
        return res(
          ctx.status(400, "My Error"),
          ctx.json({ error: "My Special Error" })
        );
      });
      await request.completed;

      expect(request.onSuccess).not.toBeCalled();
      expect(request.onError).toBeCalledTimes(1);

      const [uiErrorMessage] = request.onError.mock.calls[0];
      expect(uiErrorMessage).toStrictEqual(
        'Error from server: "400 My Error". My Special Error'
      );
    });

    it("does not retry the request", async () => {
      let isFirstRequest = true;
      const request = callBaseRequest((_req, res, ctx) => {
        if (isFirstRequest) {
          isFirstRequest = false;
          return res(
            ctx.status(400, "My Error"),
            ctx.json({ error: "My Special Error" })
          );
        }
        return res(ctx.json({ foo: "bar" }));
      });
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
    requestParams: Omit<RequestParams, "url">,
    responseResolver: ResponseResolver<MockedRequest, typeof restContext>
  ) {
    const url = `${API_ROOT}/api-test`;
    const method = requestParams.method.toLowerCase() as keyof typeof rest;
    const mockedResponseResolver = jest.fn(responseResolver);
    const serverCalls = mockedResponseResolver.mock.calls;
    server.use(rest[method](url, mockedResponseResolver));

    const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
    const allRequestParams: RequestParams = { ...requestParams, url };
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

// Most of the tests from here on down are technically integration tests, since
// they rely on the behavior of the mock server

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
        .calls[0] as OnErrorParams;
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

      const [uiErrorMessage] = handlers.onError.mock.calls[0] as OnErrorParams;
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
        .calls[0] as OnErrorParams;
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

// Tests for error responses in this block only entail checking that onError()
// was called. *What* it's called with is up to baseAuthenticatedRequest().
(function authenticatedRequests() {
  const testInstrument = MOCK_DATA.instruments[1];
  const nonOwnerUserId = "not|theOwner";
  const ownerAccessTokenPromise = Promise.resolve(
    jws.sign({
      header: { alg: "HS256", typ: "JWT" },
      payload: { sub: testInstrument.userId },
      secret: "doesn't matter for this test",
    })
  );
  const nonOwnerAccessTokenPromise = Promise.resolve(
    jws.sign({
      header: { alg: "HS256", typ: "JWT" },
      payload: { sub: nonOwnerUserId },
      secret: "doesn't matter for this test",
    })
  );
  const adminAccessTokenPromise = Promise.resolve(
    jws.sign({
      header: { alg: "HS256", typ: "JWT" },
      payload: { sub: nonOwnerUserId, "http:auth/roles": ["admin"] },
      secret: "doesn't matter for this test",
    })
  );

  describe("createInstrument()", () => {
    type CreateInstrumentData = Parameters<typeof createInstrument>[0];
    const newInstrumentBase: CreateInstrumentData = {
      name: "Foo",
      categoryId: 0,
      summary: "Foo is a fake instrument",
      description: "I just made it up",
      imageUrl: "",
    };
    const highestInstrumentId = Math.max(
      ...MOCK_DATA.instruments.map(({ id }) => id)
    );

    describe("given an authenticated user", () => {
      it.each([
        ["a standard user", nonOwnerAccessTokenPromise],
        ["an admin user", adminAccessTokenPromise],
      ])("calls onSuccess() for %s", async (user, accessTokenPromise) => {
        const getAccessTokenSilently = () => accessTokenPromise;
        const newInstrumentData: CreateInstrumentData = {
          ...newInstrumentBase,
          description: `Created by ${user}`, // Unique for both tests
        };
        const expectedResult = {
          ...newInstrumentData,
          id: highestInstrumentId + 1,
          userId: nonOwnerUserId,
        };

        {
          const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
          const { completed } = createInstrument(
            newInstrumentData,
            getAccessTokenSilently,
            handlers
          );
          await completed;

          expect(handlers.onSuccess).toBeCalledWith(expectedResult);
          expect(handlers.onError).not.toBeCalled();
        }

        // Verify that the change persists (really a test for the mock server)
        {
          const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
          const { completed } = getInstrumentById(expectedResult.id, handlers);
          await completed;
          expect(handlers.onSuccess).toBeCalledWith(expectedResult);
        }
      });
    });

    describe("given an invalid access token", () => {
      const invalidJSONWebSignature = "not-a-valid-jws";
      const jwsWithoutPayloadSub = jws.sign({
        header: { alg: "HS256", typ: "JWT" },
        payload: {}, // No .sub (subject/userId)
        secret: "doesn't matter for this test",
      });
      it.each([
        ["invalid JSON Web Signature", invalidJSONWebSignature],
        ["JSON Web Signature without payload.sub", jwsWithoutPayloadSub],
      ])("calls onError() for %s", async (_description, accessToken) => {
        const getAccessTokenSilently = () => Promise.resolve(accessToken);
        const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
        const { completed } = createInstrument(
          newInstrumentBase,
          getAccessTokenSilently,
          handlers
        );
        await completed;

        expect(handlers.onSuccess).not.toBeCalled();
        expect(handlers.onError).toBeCalled();
      });
    });
  });

  describe("updateInstrument()", () => {
    type UpdateInstrumentData = Parameters<typeof updateInstrument>[1];
    const updatedInstrumentBase: UpdateInstrumentData = {
      name: "Foo",
      categoryId: 2,
      summary: "Foo is a fake instrument",
      description: "I just made it up",
      imageUrl: "",
    };

    describe("given an authenticated user", () => {
      it.each([
        ["the owning user", ownerAccessTokenPromise],
        ["an admin user", adminAccessTokenPromise],
      ])("calls onSuccess() for %s", async (user, accessTokenPromise) => {
        const getAccessTokenSilently = () => accessTokenPromise;
        const updatedInstrumentData: UpdateInstrumentData = {
          ...updatedInstrumentBase,
          description: `Created by ${user}`, // Unique for both tests
        };
        const expectedResult = {
          ...updatedInstrumentData,
          id: testInstrument.id,
          userId: testInstrument.userId,
        };

        {
          const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
          const { completed } = updateInstrument(
            testInstrument.id,
            updatedInstrumentData,
            getAccessTokenSilently,
            handlers
          );
          await completed;

          expect(handlers.onSuccess).toBeCalledWith(expectedResult);
          expect(handlers.onError).not.toBeCalled();
        }

        // Verify that the change persists (really a test for the mock server)
        {
          const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
          const { completed } = getInstrumentById(testInstrument.id, handlers);
          await completed;
          expect(handlers.onSuccess).toBeCalledWith(expectedResult);
        }
      });

      it("calls onError() for a user who isn't the owner", async () => {
        const getAccessTokenSilently = () => nonOwnerAccessTokenPromise;
        const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
        const { completed } = updateInstrument(
          testInstrument.id,
          updatedInstrumentBase,
          getAccessTokenSilently,
          handlers
        );
        await completed;

        expect(handlers.onSuccess).not.toBeCalled();
        expect(handlers.onError).toBeCalled();
      });
    });

    describe("given an invalid access token", () => {
      const invalidJSONWebSignature = "not-a-valid-jws";
      const jwsWithoutPayloadSub = jws.sign({
        header: { alg: "HS256", typ: "JWT" },
        payload: {}, // No .sub (subject/userId)
        secret: "doesn't matter for this test",
      });
      it.each([
        ["invalid JSON Web Signature", invalidJSONWebSignature],
        ["JSON Web Signature without payload.sub", jwsWithoutPayloadSub],
      ])("calls onError() for %s", async (_description, accessToken) => {
        const getAccessTokenSilently = () => Promise.resolve(accessToken);
        const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
        const { completed } = updateInstrument(
          testInstrument.id,
          updatedInstrumentBase,
          getAccessTokenSilently,
          handlers
        );
        await completed;

        expect(handlers.onSuccess).not.toBeCalled();
        expect(handlers.onError).toBeCalled();
      });
    });

    describe("given an invalid instrument ID", () => {
      it.each([
        ["a valid ID, but one not present in the DB", 1337],
        ["a large integer represented in scientific notation", 1e99],
        ["a fractional number", 1.1],
        ["a negative integer", -1],
        ["Infinity", Infinity],
        ["NaN", NaN],
      ])("calls onError() for %s", async (_description, id) => {
        const getAccessTokenSilently = () => nonOwnerAccessTokenPromise;
        const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
        const { completed } = updateInstrument(
          id,
          updatedInstrumentBase,
          getAccessTokenSilently,
          handlers
        );
        await completed;

        expect(handlers.onSuccess).not.toBeCalled();
        expect(handlers.onError).toBeCalled();
      });
    });
  });

  describe("deleteInstrument()", () => {
    describe("given an authenticated user", () => {
      it.each([
        ["the owning user", ownerAccessTokenPromise],
        ["an admin user", adminAccessTokenPromise],
      ])("calls onSuccess() for %s", async (_user, accessTokenPromise) => {
        const getAccessTokenSilently = () => accessTokenPromise;

        {
          const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
          const { completed } = deleteInstrument(
            testInstrument.id,
            getAccessTokenSilently,
            handlers
          );
          await completed;

          expect(handlers.onSuccess).toBeCalled(); // No content
          expect(handlers.onError).not.toBeCalled();
        }

        // Verify that the change persists (really a test for the mock server)
        {
          const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
          const { completed } = getInstrumentById(testInstrument.id, handlers);
          await completed;
          expect(handlers.onError).toBeCalled();
          const [, error] = handlers.onError.mock.calls[0] as OnErrorParams;
          expect(error.response?.status).toStrictEqual(404);
        }
      });

      it("calls onSuccess() for a non-existant instrument ID", async () => {
        const getAccessTokenSilently = () => nonOwnerAccessTokenPromise;
        const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
        const { completed } = deleteInstrument(
          3333, // Valid ID, but not in our mock DB
          getAccessTokenSilently,
          handlers
        );
        await completed;

        expect(handlers.onSuccess).toBeCalled(); // Idempotent request
        expect(handlers.onError).not.toBeCalled();
      });

      it("calls onError() for a user who isn't the owner", async () => {
        const getAccessTokenSilently = () => nonOwnerAccessTokenPromise;
        const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
        const { completed } = deleteInstrument(
          testInstrument.id,
          getAccessTokenSilently,
          handlers
        );
        await completed;

        expect(handlers.onSuccess).not.toBeCalled();
        expect(handlers.onError).toBeCalled();
      });
    });

    describe("given an invalid access token", () => {
      const invalidJSONWebSignature = "not-a-valid-jws";
      const jwsWithoutPayloadSub = jws.sign({
        header: { alg: "HS256", typ: "JWT" },
        payload: {}, // No .sub (subject/userId)
        secret: "doesn't matter for this test",
      });
      it.each([
        ["invalid JSON Web Signature", invalidJSONWebSignature],
        ["JSON Web Signature without payload.sub", jwsWithoutPayloadSub],
      ])("calls onError() for %s", async (_description, accessToken) => {
        const getAccessTokenSilently = () => Promise.resolve(accessToken);
        const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
        const { completed } = deleteInstrument(
          testInstrument.id,
          getAccessTokenSilently,
          handlers
        );
        await completed;

        expect(handlers.onSuccess).not.toBeCalled();
        expect(handlers.onError).toBeCalled();
      });
    });

    describe("given an invalid instrument ID", () => {
      it.each([
        ["a large integer represented in scientific notation", 1e99],
        ["a fractional number", 1.1],
        ["a negative integer", -1],
        ["Infinity", Infinity],
        ["NaN", NaN],
      ])("calls onError() for %s", async (_description, id) => {
        const getAccessTokenSilently = () => nonOwnerAccessTokenPromise;
        const handlers = { onSuccess: jest.fn(), onError: jest.fn() };
        const { completed } = deleteInstrument(
          id,
          getAccessTokenSilently,
          handlers
        );
        await completed;

        expect(handlers.onSuccess).not.toBeCalled();
        expect(handlers.onError).toBeCalled();
      });
    });
  });
})();

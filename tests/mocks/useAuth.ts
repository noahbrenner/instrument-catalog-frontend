/**
 * This module mocks useAuth() and provides tools to mock specific auth states
 *
 * Example usage:
 *
 * ```typescript
 * import { render } from "@testing-library/react";
 * import {
 *   useAuth,
 *   mockAuthenticatedUser,
 *   UNAUTHENTICATED
 * } from "#mocks/useAuth" // This module
 *
 * // For auth states other than AUTHENTICATED, just mock the return value
 * it("does something when the user is logged out", () => {
 *   useAuth.mockReturnValue(UNAUTHENTICATED);
 *   render(<SomeCompoenentThatUses_useAuth />);
 * });
 *
 * // For AUTHENTICATED states, pass a userId to the provided function
 * it("does something when the user is logged in", () => {
 *   const user = mockAuthenticatedUser("someUserId");
 *   render(<SomeCompoenentThatUses_useAuth />);
 * });
 * ```
 */

import jws from "jws";
import { createContext } from "react";
import { mocked } from "ts-jest/utils";

import { useAuth as useAuthOriginal } from "#hooks/useAuth";
import type { Auth } from "#hooks/useAuth";
import type { IUser } from "#src/types";

// THESE ARE SIDE EFFECTS! Importing this mock module mocks the originals
jest.mock("#hooks/useAuth");
jest.mock("@auth0/auth0-react", () => ({
  Auth0Provider: createContext(undefined).Provider, // Mock as a noop
}));

/**
 * Primary Usage: useAuth.mockReturnValue(...)
 *
 * Unless you have a special use case, you shouldn't use .mockReturnValueOnce().
 * Components may rerender due to unrelated state changes, causing another call
 * to useAuth() which would no longer return your mocked value.
 *
 * Since `clearMocks: true` is set in jest.config.js, mocked return values won't
 * leak into other tests, even when using plain old .mockReturnValue().
 */
export const useAuth = mocked(useAuthOriginal);

export const LOADING: Auth & { state: "LOADING" } = {
  state: "LOADING",
  login: jest.fn(),
};

export const ERRORED: Auth & { state: "ERRORED" } = {
  state: "ERRORED",
  error: new Error(),
  login: jest.fn(),
};

export const UNAUTHENTICATED: Auth & { state: "UNAUTHENTICATED" } = {
  state: "UNAUTHENTICATED",
  login: jest.fn(),
};

/** Mock useAuth()'s return value to reflect a specific AUTHENTICATED state */
export function mockAuthenticatedUser(userId: string, isAdmin = false): IUser {
  const payload: Pick<IUser, "sub" | "http:auth/roles"> = {
    sub: userId,
    "http:auth/roles": isAdmin ? ["admin"] : [],
  };
  const accessToken = jws.sign({
    payload,
    header: { alg: "HS256", typ: "JWT" },
    secret: "verysecret",
  });
  const user: IUser = { name: "Ima User", ...payload };

  useAuth.mockReturnValue({
    state: "AUTHENTICATED",
    user,
    logout: () => {
      useAuth.mockReturnValue(UNAUTHENTICATED);
    },
    getAccessTokenSilently: () => Promise.resolve(accessToken),
  });

  return user;
}

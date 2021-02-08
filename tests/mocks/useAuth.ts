/**
 * This module mocks useAuth() and exports example return values for it
 *
 * Example usage:
 *
 * ```typescript
 * import { render } from "@testing-library/react";
 * import { useAuth, AUTHENTICATED } from "#mocks/useAuth" // This module
 *
 * it("does something when the user is logged in", () => {
 *   useAuth.mockReturnValue(AUTHENTICATED);
 *   render(<SomeCompoenentThatUses_useAuth />);
 * });
 * ```
 */

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

// We reuse the same functions for any return values that use them
export const login = jest.fn();
export const logout = jest.fn();
export const getAccessTokenSilently = jest.fn(() => Promise.resolve("MyT0k3n"));

export const user: IUser = { name: "Foo Bar", sub: "provider-authtype|123" };

export const LOADING: Auth & { state: "LOADING" } = {
  state: "LOADING",
  login,
};

export const ERRORED: Auth & { state: "ERRORED" } = {
  state: "ERRORED",
  error: new Error(),
  login,
};

export const UNAUTHENTICATED: Auth & { state: "UNAUTHENTICATED" } = {
  state: "UNAUTHENTICATED",
  login,
};

export const AUTHENTICATED: Auth & { state: "AUTHENTICATED" } = {
  state: "AUTHENTICATED",
  user,
  logout,
  getAccessTokenSilently,
};

export const AUTHENTICATED_ADMIN: Auth & { state: "AUTHENTICATED" } = {
  state: "AUTHENTICATED",
  user: { ...user, "http:auth/roles": ["admin"] },
  logout,
  getAccessTokenSilently,
};

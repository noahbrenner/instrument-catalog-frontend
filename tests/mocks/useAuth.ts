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
 *   useAuth.mockReturnValueOnce(AUTHENTICATED);
 *   render(<SomeCompoenentThatUses_useAuth />);
 * });
 * ```
 */

import { mocked } from "ts-jest/utils";

import { useAuth as useAuthOriginal } from "#hooks/useAuth";
import type { Auth } from "#hooks/useAuth";
import type { IUser } from "#src/types";

// THIS IS A SIDE EFFECT! Importing this mock module mocks the original
jest.mock("#hooks/useAuth");

export const useAuth = mocked(useAuthOriginal);

// We reuse the same functions for any return values that use them
export const login = jest.fn();
export const logout = jest.fn();

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
};

export const AUTHENTICATED_ADMIN: Auth & { state: "AUTHENTICATED" } = {
  state: "AUTHENTICATED",
  user: { ...user, "http:auth/roles": ["admin"] },
  logout,
};

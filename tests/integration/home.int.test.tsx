import { within } from "@testing-library/react";
import React from "react";

import {
  useAuth,
  mockAuthenticatedUser,
  LOADING,
  ERRORED,
  UNAUTHENTICATED,
} from "#mocks/useAuth";
import { App } from "#src/App";
import { renderWithRouter } from "#test_helpers/renderWithRouter";

describe("<HomePage /> rendered inside <App />", () => {
  describe("given a user who is logged in", () => {
    test("call to action is 'post a new instrument'", () => {
      mockAuthenticatedUser("foo|123");
      const { container } = renderWithRouter(<App />, "/");
      const { getByRole, queryByRole } = within(
        container.querySelector("main") as HTMLElement
      );

      const newInstrumentLink = getByRole("link", { name: /new instrument/i });
      const loginButton = queryByRole("button", { name: /log/i });

      expect(newInstrumentLink).toHaveAttribute("href", "/instruments/new/");
      expect(loginButton).not.toBeInTheDocument();
    });
  });

  describe("given a user who is not logged in", () => {
    test.each([
      ["LOADING", LOADING],
      ["ERRORED", ERRORED],
      ["UNAUTHENTICATED", UNAUTHENTICATED],
    ])("call to action is 'log in' when auth state is %s", (_, AUTH_VALUE) => {
      useAuth.mockReturnValue(AUTH_VALUE);
      const { container } = renderWithRouter(<App />, "/");
      const { getByRole, queryByRole } = within(
        container.querySelector("main") as HTMLElement
      );

      const newInstrumentLink = queryByRole("link", {
        name: /new instrument/i,
      });
      const loginButton = getByRole("button", { name: /log/i });

      expect(newInstrumentLink).not.toBeInTheDocument();
      expect(loginButton).toBeInTheDocument();
    });
  });
});

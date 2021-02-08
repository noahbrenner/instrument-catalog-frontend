import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import {
  useAuth,
  LOADING,
  ERRORED,
  UNAUTHENTICATED,
  AUTHENTICATED,
} from "#mocks/useAuth";
import { LoginButton } from "./LoginButton";

describe("<LoginButton />", () => {
  describe.each([
    ["LOADING", LOADING],
    ["ERRORED", ERRORED],
    ["UNAUTHENTICATED", UNAUTHENTICATED],
  ])("given %s state from useAuth()", (_, AUTH_VALUE) => {
    it('renders a "Log in" button', () => {
      useAuth.mockReturnValue(AUTH_VALUE);
      render(<LoginButton />);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent(/log ?in/i);

      userEvent.click(button);
      expect(AUTH_VALUE.login).toBeCalledTimes(1);
    });
  });

  describe("given AUTHENTICATED state from useAuth()", () => {
    it('renders a "Log out" button', () => {
      useAuth.mockReturnValue(AUTHENTICATED);
      render(<LoginButton />);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent(/log ?out/i);

      userEvent.click(button);
      expect(AUTHENTICATED.logout).toBeCalledTimes(1);
    });
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import {
  mockAuthenticatedUser,
  useAuth,
  LOADING,
  ERRORED,
  UNAUTHENTICATED,
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
      mockAuthenticatedUser("foo|123");
      const { rerender } = render(<LoginButton />);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent(/log ?out/i);

      userEvent.click(button);
      rerender(<LoginButton />); // useAuth's mock doesn't trigger state changes
      expect(button).toHaveTextContent(/log ?in/i);
    });
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import type { Auth } from "#hooks/useAuth";
import { LoginButton } from "./LoginButton";

let mockUseAuthValue: Partial<Auth>;

jest.mock("#hooks/useAuth", () => ({
  useAuth: jest.fn(() => mockUseAuthValue),
}));

describe("<LoginButton />", () => {
  describe.each(["LOADING", "ERRORED", "UNAUTHENTICATED"] as const)(
    "given %s state from useAuth()",
    (authState) => {
      it('renders a "Log in" button', () => {
        const login = jest.fn();
        mockUseAuthValue = { state: authState, login };
        render(<LoginButton />);

        const button = screen.getByRole("button");
        expect(button).toHaveTextContent(/log ?in/i);

        userEvent.click(button);
        expect(login).toBeCalledTimes(1);
      });
    }
  );

  describe("given AUTHENTICATED state from useAuth()", () => {
    it('renders a "Log out" button', () => {
      const logout = jest.fn();
      mockUseAuthValue = { state: "AUTHENTICATED", logout };
      render(<LoginButton />);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent(/log ?out/i);

      userEvent.click(button);
      expect(logout).toBeCalledTimes(1);
    });
  });
});

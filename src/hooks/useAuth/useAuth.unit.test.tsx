import type { Auth0ContextInterface } from "@auth0/auth0-react";
import { render, screen } from "@testing-library/react";
import React from "react";

import { useAuth } from "./useAuth";

const mockUseAuth0Defaults: Readonly<Partial<Auth0ContextInterface>> = {
  error: undefined,
  isAuthenticated: false,
  isLoading: false,
  user: undefined,
};

let mockUseAuth0Value: Partial<Auth0ContextInterface>;

jest.mock("@auth0/auth0-react", () => ({
  useAuth0: jest.fn(() => mockUseAuth0Value),
}));

function TestComponent() {
  const auth = useAuth();
  return (
    <>
      {Object.entries(auth).map(([key, value]) => (
        <div key={key} data-testid={key}>
          {typeof value === "string" ? value : JSON.stringify(value)}
        </div>
      ))}
    </>
  );
}

describe("useAuth", () => {
  describe("given isLoading=true", () => {
    it("returns LOADING state when isAuthenticated=false", () => {
      mockUseAuth0Value = {
        ...mockUseAuth0Defaults,
        isLoading: true,
        isAuthenticated: false,
      };
      render(<TestComponent />);
      expect(screen.getByTestId("state")).toHaveTextContent(/^LOADING$/);
      expect(screen.queryByTestId("user")).not.toBeInTheDocument();
    });

    it("returns LOADING state when isAuthenticated=true", () => {
      mockUseAuth0Value = {
        ...mockUseAuth0Defaults,
        isLoading: true,
        isAuthenticated: true,
      };
      render(<TestComponent />);
      expect(screen.getByTestId("state")).toHaveTextContent(/^LOADING$/);
      expect(screen.queryByTestId("user")).not.toBeInTheDocument();
    });

    it("returns LOADING state when error=Error", () => {
      mockUseAuth0Value = {
        ...mockUseAuth0Defaults,
        isLoading: true,
        error: new Error(),
      };
      render(<TestComponent />);
      expect(screen.getByTestId("state")).toHaveTextContent(/^LOADING$/);
      expect(screen.queryByTestId("user")).not.toBeInTheDocument();
    });
  });

  describe("given isLoading=false, error=Error", () => {
    it("returns ERRORED state", () => {
      mockUseAuth0Value = {
        ...mockUseAuth0Defaults,
        isLoading: false,
        error: new Error(),
      };
      render(<TestComponent />);
      expect(screen.getByTestId("state")).toHaveTextContent(/^ERRORED$/);
      expect(screen.queryByTestId("user")).not.toBeInTheDocument();
    });

    it("returns ERRORED state when isAuthenticated=true", () => {
      mockUseAuth0Value = {
        ...mockUseAuth0Defaults,
        isLoading: false,
        error: new Error(),
        isAuthenticated: true,
      };
      render(<TestComponent />);
      expect(screen.getByTestId("state")).toHaveTextContent(/^ERRORED$/);
      expect(screen.queryByTestId("user")).not.toBeInTheDocument();
    });
  });

  describe("given isLoading=false, isAuthenticated=false, and no error", () => {
    it("returns UNAUTHENTICATED state", () => {
      mockUseAuth0Value = {
        ...mockUseAuth0Defaults,
        isLoading: false,
        isAuthenticated: false,
        error: undefined,
      };
      render(<TestComponent />);
      expect(screen.getByTestId("state")).toHaveTextContent(
        /^UNAUTHENTICATED$/
      );
      expect(screen.queryByTestId("user")).not.toBeInTheDocument();
    });
  });

  describe("given isLoading=false, isAuthenticated=true, and no error", () => {
    it("returns AUTHENTICATED state", () => {
      mockUseAuth0Value = {
        ...mockUseAuth0Defaults,
        isLoading: false,
        isAuthenticated: true,
        error: undefined,
        user: { name: "Foo Name" },
      };
      render(<TestComponent />);
      expect(screen.getByTestId("state")).toHaveTextContent(/^AUTHENTICATED$/);
      expect(screen.getByTestId("user")).toHaveTextContent("Foo Name");
    });
  });
});

import { useAuth0 } from "@auth0/auth0-react";
import { render, screen } from "@testing-library/react";
import React from "react";
import { mocked } from "ts-jest/utils";

import { useAuth } from "./useAuth";

jest.mock("@auth0/auth0-react");

const useAuth0DefaultReturnValue = {
  error: undefined,
  getAccessTokenSilently: () => Promise.resolve("myM0ckacc3s570ken"),
  isAuthenticated: false,
  isLoading: false,
  user: undefined,
  // Casting (instead of declaring a type) lets us omit unused properties
} as ReturnType<typeof useAuth0>;

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

describe("useAuth()", () => {
  describe("given isLoading=true", () => {
    it("returns LOADING state when isAuthenticated=false", () => {
      mocked(useAuth0).mockReturnValueOnce({
        ...useAuth0DefaultReturnValue,
        isLoading: true,
        isAuthenticated: false,
      });
      render(<TestComponent />);
      expect(screen.getByTestId("state")).toHaveTextContent(/^LOADING$/);
      expect(screen.queryByTestId("user")).not.toBeInTheDocument();
    });

    it("returns LOADING state when isAuthenticated=true", () => {
      mocked(useAuth0).mockReturnValueOnce({
        ...useAuth0DefaultReturnValue,
        isLoading: true,
        isAuthenticated: true,
      });
      render(<TestComponent />);
      expect(screen.getByTestId("state")).toHaveTextContent(/^LOADING$/);
      expect(screen.queryByTestId("user")).not.toBeInTheDocument();
    });

    it("returns LOADING state when error=Error", () => {
      mocked(useAuth0).mockReturnValueOnce({
        ...useAuth0DefaultReturnValue,
        isLoading: true,
        error: new Error(),
      });
      render(<TestComponent />);
      expect(screen.getByTestId("state")).toHaveTextContent(/^LOADING$/);
      expect(screen.queryByTestId("user")).not.toBeInTheDocument();
    });
  });

  describe("given isLoading=false, error=Error", () => {
    it("returns ERRORED state", () => {
      mocked(useAuth0).mockReturnValueOnce({
        ...useAuth0DefaultReturnValue,
        isLoading: false,
        error: new Error(),
      });
      render(<TestComponent />);
      expect(screen.getByTestId("state")).toHaveTextContent(/^ERRORED$/);
      expect(screen.queryByTestId("user")).not.toBeInTheDocument();
    });

    it("returns ERRORED state when isAuthenticated=true", () => {
      mocked(useAuth0).mockReturnValueOnce({
        ...useAuth0DefaultReturnValue,
        isLoading: false,
        error: new Error(),
        isAuthenticated: true,
      });
      render(<TestComponent />);
      expect(screen.getByTestId("state")).toHaveTextContent(/^ERRORED$/);
      expect(screen.queryByTestId("user")).not.toBeInTheDocument();
    });
  });

  describe("given isLoading=false, isAuthenticated=false, and no error", () => {
    it("returns UNAUTHENTICATED state", () => {
      mocked(useAuth0).mockReturnValueOnce({
        ...useAuth0DefaultReturnValue,
        isLoading: false,
        isAuthenticated: false,
        error: undefined,
      });
      render(<TestComponent />);
      expect(screen.getByTestId("state")).toHaveTextContent(
        /^UNAUTHENTICATED$/
      );
      expect(screen.queryByTestId("user")).not.toBeInTheDocument();
    });
  });

  describe("given isLoading=false, isAuthenticated=true, and no error", () => {
    it("returns AUTHENTICATED state", () => {
      mocked(useAuth0).mockReturnValueOnce({
        ...useAuth0DefaultReturnValue,
        isLoading: false,
        isAuthenticated: true,
        error: undefined,
        user: { name: "Foo Name", sub: "foo-provider|id" },
      });
      render(<TestComponent />);
      expect(screen.getByTestId("state")).toHaveTextContent(/^AUTHENTICATED$/);
      expect(screen.getByTestId("user")).toHaveTextContent("Foo Name");
      expect(screen.getByTestId("getAccessTokenSilently")).toBeInTheDocument();
    });
  });
});

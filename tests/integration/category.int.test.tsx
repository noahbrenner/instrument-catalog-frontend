import { screen, waitFor } from "@testing-library/react";
import React, { createContext } from "react";

import { useAuth, LOADING } from "#mocks/useAuth";
import { App } from "#src/App";
import { renderWithRouter } from "../helpers/renderWithRouter";

// Mock Auth0Provider as a noop
jest.mock("@auth0/auth0-react", () => ({
  Auth0Provider: createContext(undefined).Provider,
}));

// We're only testing the LOADING auth state because that's the initial state
// and the page content we're testing doesn't depend on being authenticated
useAuth.mockReturnValue(LOADING);

function waitForPageLoad() {
  return waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
}

describe("src/pages/category.tsx rendered inside <App />", () => {
  describe("given a navigation from an invalid path to a valid path", () => {
    // This would fail if the component's state were not reset when navigating
    it("renders data for the valid path", async () => {
      const { history } = renderWithRouter(<App />, "/categories/badPath/");
      await waitForPageLoad();
      await history.navigate("/categories/winds/");

      await waitFor(() => {
        const heading2 = screen.queryByRole("heading", { level: 2 });
        expect(heading2).toHaveTextContent(/winds/i);
      });

      await waitForPageLoad(); // Wait for AJAX request to finish
    });
  });

  describe("given a navigation from one valid path to another", () => {
    // This would fail if the component's state were not reset when navigating
    it("renders data for the second path", async () => {
      const { history } = renderWithRouter(<App />, "/categories/winds/");
      await waitForPageLoad();
      await history.navigate("/categories/strings/");

      await waitFor(() => {
        const heading2 = screen.queryByRole("heading", { level: 2 });
        expect(heading2).toHaveTextContent(/strings/i);
      });

      await waitForPageLoad(); // Wait for AJAX request to finish
    });
  });
});

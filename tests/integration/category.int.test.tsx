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

describe("<CategoryPage /> rendered inside <App />", () => {
  describe("given the path /categories/percussion/", () => {
    it("renders data for the category and its instruments", async () => {
      renderWithRouter(<App />, "/categories/percussion/");

      // Category data is rendered
      const heading2 = await screen.findByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent(/Percussion/);

      // Instruments for the category are rendered (with values from mock data)
      const headings3 = await screen.findAllByRole("heading", { level: 3 });
      expect(headings3).toHaveLength(2);
      expect(headings3[0]).toHaveTextContent("Timpani");
      expect(headings3[1]).toHaveTextContent("Marimba");
    });
  });

  describe("given a navigation from an invalid path to a valid path", () => {
    it("renders data for the valid path", async () => {
      const { history, unmount } = renderWithRouter(
        <App />,
        "/categories/badPath/"
      );

      // Invalid path
      const heading2Invalid = await screen.findByRole("heading", { level: 2 });
      expect(heading2Invalid).toHaveTextContent(/404/);

      // Valid path
      await waitFor(() => history.navigate("/categories/winds/"));
      const heading2Valid = await screen.findByRole("heading", { level: 2 });
      expect(heading2Valid).toHaveTextContent(/Winds/);

      unmount();
    });
  });

  describe("given a navigation from one valid path to another", () => {
    it("renders data for the second path", async () => {
      const { history, unmount } = renderWithRouter(
        <App />,
        "/categories/winds/"
      );

      // First valid path
      const heading2Winds = await screen.findByRole("heading", { level: 2 });
      expect(heading2Winds).toHaveTextContent(/Winds/);

      // Second valid path
      await waitFor(() => history.navigate("/categories/strings/"));
      const heading2Strings = await screen.findByRole("heading", { level: 2 });
      expect(heading2Strings).toHaveTextContent(/Strings/);

      unmount();
    });
  });
});

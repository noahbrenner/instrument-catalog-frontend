import { screen, waitFor } from "@testing-library/react";
import React, { createContext } from "react";

import { useAuth, LOADING } from "#mocks/useAuth";
import { App } from "#src/App";
import { renderWithRouter } from "../helpers/renderWithRouter";

// Mock Auth0Provider as a noop
jest.mock("@auth0/auth0-react", () => ({
  Auth0Provider: createContext(undefined).Provider,
}));

// We're only testing the LOADING auth state because any router redirects should
// kick in before that state changes (and we're not testing content here anyway)
useAuth.mockReturnValue(LOADING);

function waitForPageLoad() {
  return waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
}

describe("<InstrumentPage /> rendered inside <App />", () => {
  describe("given the canonical path for an instrument", () => {
    it.each(["/instruments/0/Flute/", "/instruments/4/Double%20Bass/"])(
      "does not modify the path %s",
      async (path) => {
        const { history } = renderWithRouter(<App />, path);
        await waitForPageLoad();
        expect(history.location.pathname).toBe(path);
      }
    );
  });

  describe("given missing or extra characters in a path", () => {
    const canonicalPath = "/instruments/0/Flute/";
    it.each([
      "/instruments/0",
      "/instruments/0/",
      "/instruments/0/Flute",
      "/instruments/0/Flute/foo/",
    ])(`redirects %s -> ${canonicalPath}`, async (path) => {
      const { history } = renderWithRouter(<App />, path);
      await waitForPageLoad();
      expect(history.location.pathname).toBe(canonicalPath);
    });
  });

  describe("given a non-existent instrument ID", () => {
    it.each([
      "/instruments/Flute/",
      "/instruments/-2/",
      "/instruments/7000/", // Valid ID, but it's not in our mock data
    ])("displays the 404 error page for %s", async (path) => {
      renderWithRouter(<App />, path);
      await waitForPageLoad();
      const heading2 = screen.getByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent(/404/);
    });
  });

  describe("given a navigation from an invalid path to a valid path", () => {
    it("renders data for the valid path", async () => {
      const { history } = renderWithRouter(<App />, "/instruments/badPath/");

      // Invalid path
      const heading2Invalid = await screen.findByRole("heading", { level: 2 });
      expect(heading2Invalid).toHaveTextContent(/404/);

      // await waitForPageLoad();
      await waitFor(() => history.navigate("/instruments/0/Flute/"));
      const heading2Valid = await screen.findByRole("heading", { level: 2 });
      expect(heading2Valid).toHaveTextContent(/Flute/);
    });
  });

  describe("given a navigation from one valid path to another", () => {
    it("renders data for the second path", async () => {
      const { history } = renderWithRouter(<App />, "/instruments/0/Flute/");

      // First valid path
      const heading2Invalid = await screen.findByRole("heading", { level: 2 });
      expect(heading2Invalid).toHaveTextContent(/Flute/);

      // Second valid path
      await waitFor(() => history.navigate("/instruments/4/Double%20Bass/"));
      const heading2Valid = await screen.findByRole("heading", { level: 2 });
      expect(heading2Valid).toHaveTextContent(/Double Bass/);
    });
  });
});

/**
 * This file mostly tests the handling of redirects in src/pages/instrument.tsx
 *
 * Tests that validate page *content* either go in an individual component's
 * unit test file or in tests/integration/routes.int.test.tsx
 */
import type { History as RouterHistory } from "@reach/router";
import { screen, waitFor } from "@testing-library/react";
import React, { createContext } from "react";

import { useAuth, LOADING } from "#mocks/useAuth";
import { App } from "#src/App";
import { renderWithRouter } from "#test_helpers/renderWithRouter";

// Mock Auth0Provider as a noop
jest.mock("@auth0/auth0-react", () => ({
  Auth0Provider: createContext(undefined).Provider,
}));

// We're only testing the LOADING auth state because any router redirects should
// kick in before that state changes (and we're not testing content here anyway)
useAuth.mockReturnValue(LOADING);

/**
 * Return a promise which resolves the next time `history.location` changes
 *
 * The promise resolves with the new location
 * The promise rejects after a timeout (default 1 second) if no change occurs
 */
function pathnameChange(history: RouterHistory, timeout = 1000) {
  return waitFor(() => {
    return new Promise<string>((resolve, reject) => {
      let timeoutRef: number;

      const unsubscribe = history.listen(({ location }) => {
        clearTimeout(timeoutRef);
        unsubscribe();
        resolve(location.pathname);
      });

      timeoutRef = setTimeout(() => {
        unsubscribe();
        reject();
      }, timeout);
    });
  });
}

describe("<InstrumentPage /> rendered inside <App />", () => {
  describe("given the canonical path for an instrument display page", () => {
    // One instrument has a space in its name to verify URL encoding behavior
    it.each(["/instruments/0/Flute/", "/instruments/4/Double%20Bass/"])(
      "does not modify the path %s",
      async (path) => {
        const { history } = renderWithRouter(<App />, path);
        await waitFor(() => {
          expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });
        expect(history.location.pathname).toBe(path);
      }
    );
  });

  describe("given the canonical path for an instrument edit page", () => {
    it.each([
      "/instruments/0/Flute/edit/",
      "/instruments/4/Double%20Bass/edit/",
    ])("does not modify the path %s", async (path) => {
      const { history } = renderWithRouter(<App />, path);
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
      expect(history.location.pathname).toBe(path);
    });
  });

  describe("given missing or extra characters in a display path", () => {
    const canonicalPath = "/instruments/0/Flute/";
    it.each([
      "/instruments/0",
      "/instruments/0/",
      "/instruments/0/Flute",
      "/instruments/0/wrong-name",
      "/instruments/0/wrong-name/",
      "/instruments/0/Flute/extra-segment/",
    ])(`redirects %s -> ${canonicalPath}`, async (path) => {
      const { history } = renderWithRouter(<App />, path);
      const nextPathname = await pathnameChange(history);
      expect(nextPathname).toBe(canonicalPath);
    });
  });

  describe("given missing or extra characters in an edit path", () => {
    const canonicalPath = "/instruments/0/Flute/edit/";
    it.each([
      "/instruments/0/edit",
      "/instruments/0/edit/",
      "/instruments/0/Flute/edit",
      "/instruments/0/wrong-name/edit",
      "/instruments/0/wrong-name/edit/",
      "/instruments/0/Flute/extra-segment/edit",
      "/instruments/0/Flute/extra-segment/edit/",
    ])(`redirects %s -> ${canonicalPath}`, async (path) => {
      const { history, unmount } = renderWithRouter(<App />, path);
      const nextPathname = await pathnameChange(history);
      expect(nextPathname).toBe(canonicalPath);
      unmount();
    });
  });

  describe("given a non-existent instrument ID", () => {
    it.each([
      "/instruments",
      "/instruments/",
      "/instruments/Flute/",
      "/instruments/edit/",
      "/instruments/-2/",
      "/instruments/7000/", // Valid ID, but it's not in our mock data
    ])("displays the 404 error page for %s", async (path) => {
      renderWithRouter(<App />, path);
      const heading2 = await screen.findByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent(/404/);
    });
  });

  // The following tests check page content to verify that:
  // 1. The correct component is rendered inside <InstrumentPage />'s <Router />
  // 2. State does not go stale when navigating between <InstrumentPage /> pages

  describe("given a navigation from an invalid path to a valid path", () => {
    it.each([
      ["/instruments/0/Flute/", /^Flute/],
      ["/instruments/4/Double%20Bass/edit/", /edit instrument.*double bass/i],
    ])("renders data for the valid path %s", async (goodPath, headingText) => {
      const { history } = renderWithRouter(<App />, "/instruments/badPath/");

      // Invalid path
      const heading2Invalid = await screen.findByRole("heading", { level: 2 });
      expect(heading2Invalid).toHaveTextContent(/404/);

      // Valid path
      await waitFor(() => history.navigate(goodPath));
      const heading2Valid = await screen.findByRole("heading", { level: 2 });
      expect(heading2Valid).toHaveTextContent(headingText);
    });
  });

  describe("given a navigation from one valid display path to another", () => {
    it("renders data for the second path", async () => {
      const { history } = renderWithRouter(<App />, "/instruments/0/Flute/");

      // First path
      const heading2First = await screen.findByRole("heading", { level: 2 });
      expect(heading2First).toHaveTextContent(/^Flute/);

      // Second path
      await waitFor(() => history.navigate("/instruments/4/Double%20Bass/"));
      const heading2Second = await screen.findByRole("heading", { level: 2 });
      expect(heading2Second).toHaveTextContent(/^Double Bass/);
    });
  });

  describe("given a navigation from one valid edit path to another", () => {
    it("renders data for the second path", async () => {
      const { history } = renderWithRouter(
        <App />,
        "/instruments/0/Flute/edit/"
      );

      // First path
      const heading2First = await screen.findByRole("heading", { level: 2 });
      expect(heading2First).toHaveTextContent(/edit instrument.* flute/i);

      // Second path
      await waitFor(() =>
        history.navigate("/instruments/4/Double%20Bass/edit/")
      );
      const heading2Second = await screen.findByRole("heading", { level: 2 });
      expect(heading2Second).toHaveTextContent(/edit instrument.*double bass/i);
    });
  });
});

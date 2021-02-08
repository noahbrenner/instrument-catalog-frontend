/**
 * This file mostly tests the handling of redirects in src/pages/instrument.tsx
 *
 * Tests that validate page *content* either go in an individual component's
 * unit test file or in tests/integration/routes.int.test.tsx
 */
import type { History as RouterHistory } from "@reach/router";
import { screen, waitFor } from "@testing-library/react";
import React from "react";

import {
  useAuth,
  AUTHENTICATED,
  AUTHENTICATED_ADMIN,
  ERRORED,
  LOADING,
  UNAUTHENTICATED,
} from "#mocks/useAuth";
import { App } from "#src/App";
import { MOCK_DATA } from "#src/server_routes.mock";
import { renderWithRouter } from "#test_helpers/renderWithRouter";

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

describe("<InstrumentPage /> rendered inside <App /> when logged out", () => {
  beforeEach(() => {
    useAuth.mockReturnValue(UNAUTHENTICATED);
  });

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
      ["/instruments/0/Flute/", /\bFlute\b/],
      ["/instruments/4/Double%20Bass/edit/", /\bDouble Bass\b/],
    ])("renders data for the valid path %s", async (goodPath, textContent) => {
      const { history } = renderWithRouter(<App />, "/instruments/badPath/");

      // Invalid path
      const heading2Invalid = await screen.findByRole("heading", { level: 2 });
      expect(heading2Invalid).toHaveTextContent(/404/);

      // Valid path
      await waitFor(() => history.navigate(goodPath));
      expect((await screen.findAllByText(textContent))[0]).toBeInTheDocument();
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
      expect((await screen.findAllByText(/\bFlute\b/))[0]).toBeInTheDocument();

      // Second path
      await waitFor(() =>
        history.navigate("/instruments/4/Double%20Bass/edit/")
      );
      expect(
        (await screen.findAllByText(/\bDouble Bass\b/))[0]
      ).toBeInTheDocument();
    });
  });
});

describe("<InstrumentPage /> inside <App /> at an instrument edit path", () => {
  const editPagePath = "/instruments/0/Flute/edit/";
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const flute = MOCK_DATA.instruments.find(({ id }) => id === 0)!;

  describe("given the LOADING auth state", () => {
    it("displays the loading message", async () => {
      useAuth.mockReturnValue(LOADING);
      const { unmount } = renderWithRouter(<App />, editPagePath);

      expect(await screen.findByText(/loading/i)).toBeInTheDocument();
      unmount();
    });
  });

  describe("given the ERRORED auth state", () => {
    it('displays a "Not Permitted" message', async () => {
      useAuth.mockReturnValue(ERRORED);
      const { unmount } = renderWithRouter(<App />, editPagePath);

      const heading2 = await screen.findByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent("Not Permitted");
      expect(screen.getByText(/you need to log in/i)).toBeInTheDocument();
      unmount();
    });
  });

  describe("given an UNAUTHENTICATED (logged out) user", () => {
    it('displays a "Not Permitted" message', async () => {
      useAuth.mockReturnValue(UNAUTHENTICATED);
      const { unmount } = renderWithRouter(<App />, editPagePath);

      const heading2 = await screen.findByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent("Not Permitted");
      expect(screen.getByText(/you need to log in/i)).toBeInTheDocument();
      unmount();
    });
  });

  // describe("given a user who does not own the instrument", () => {
  describe("given an AUTHENTICATED user who doesn't own the instrument", () => {
    it('displays a "Not Permitted" message', async () => {
      useAuth.mockReturnValue({
        ...AUTHENTICATED,
        user: { ...AUTHENTICATED.user, sub: `${flute.userId}notOwner` },
      });
      const { unmount } = renderWithRouter(<App />, editPagePath);

      const heading2 = await screen.findByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent("Not Permitted");
      expect(
        screen.getByText(/you can only edit instruments.*created/i)
      ).toBeInTheDocument();

      unmount();
    });
  });

  describe("given the AUTHENTICATED user who owns the instrument", () => {
    it("displays the <InstrumentForm /> edit page", async () => {
      useAuth.mockReturnValue({
        ...AUTHENTICATED,
        user: { ...AUTHENTICATED.user, sub: flute.userId },
      });
      const { unmount } = renderWithRouter(<App />, editPagePath);

      const heading2 = await screen.findByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent(/edit instrument.*flute/i);

      unmount();
    });
  });

  describe("given an AUTHENTICATED admin user", () => {
    it("displays the <InstrumentForm /> edit page", async () => {
      useAuth.mockReturnValue(AUTHENTICATED_ADMIN);
      const { unmount } = renderWithRouter(<App />, editPagePath);

      expect(AUTHENTICATED_ADMIN.user.sub).not.toEqual(flute.userId);
      const heading2 = await screen.findByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent(/edit instrument.*flute/i);

      unmount();
    });
  });
});

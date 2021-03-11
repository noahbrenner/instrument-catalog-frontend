import { screen } from "@testing-library/react";
import React from "react";

import {
  mockAuthenticatedUser,
  useAuth,
  LOADING,
  UNAUTHENTICATED,
} from "#mocks/useAuth";
import { App } from "#src/App";
import { renderWithRouter } from "#test_helpers/renderWithRouter";

describe("<App />", () => {
  describe.each([
    ["logged out", () => useAuth.mockReturnValue(UNAUTHENTICATED)],
    ["logged in", () => mockAuthenticatedUser("foo|123")],
  ])("when %s", (_, mockAuthState) => {
    beforeEach(mockAuthState);

    describe("given the route '/'", () => {
      it("displays content from Home page", async () => {
        const { unmount } = renderWithRouter(<App />, "/");

        const heading1 = await screen.findByRole("heading", { level: 1 });
        expect(heading1).toHaveTextContent(/instrument catalog/i);

        const heading2 = await screen.findByRole("heading", { level: 2 });
        expect(heading2).toHaveTextContent(/browse by category/i);

        unmount();
      });
    });

    describe("given the route '/does-not-exist/'", () => {
      it("displays the 404 error page", async () => {
        renderWithRouter(<App />, "/does-not-exist/");

        const heading2 = await screen.findByRole("heading", { level: 2 });
        expect(heading2).toHaveTextContent(/404/);
      });
    });

    describe("given the route '/categories/'", () => {
      it("displays content from Categories page", async () => {
        const { unmount } = renderWithRouter(<App />, "/categories/");

        const heading2 = screen.getByRole("heading", { level: 2 });
        expect(heading2).toHaveTextContent(/categories/i);

        unmount();
      });
    });

    describe("given the route '/categories/strings/'", () => {
      it("displays content for the Strings Category page", async () => {
        const { unmount } = renderWithRouter(<App />, "/categories/strings/");

        const heading2 = await screen.findByRole("heading", { level: 2 });
        expect(heading2).toHaveTextContent(/strings/i);

        unmount();
      });
    });

    describe("given the route '/instruments/'", () => {
      it("displays the 404 error page", async () => {
        const { unmount } = renderWithRouter(<App />, "/instruments/");

        const heading2 = await screen.findByRole("heading", { level: 2 });
        expect(heading2).toHaveTextContent(/404/);

        unmount();
      });
    });

    // This quick test is mostly for documenting the route. More thorough tests
    // for Instrument & Instrument Edit pages are in instrument.int.test.tsx
    describe("given the route '/instruments/0/Flute/'", () => {
      it("displays the Flute Instrument page", async () => {
        const { unmount } = renderWithRouter(<App />, "/instruments/0/Flute/");

        const heading2 = await screen.findByRole("heading", { level: 2 });
        expect(heading2).toHaveTextContent(/Flute/);

        unmount();
      });
    });
  });

  describe("given the route '/instruments/new/'", () => {
    it("displays the New Instrument form when logged in", async () => {
      mockAuthenticatedUser("foo|123");
      const { unmount } = renderWithRouter(<App />, "/instruments/new/");

      const heading2 = await screen.findByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent(/new instrument/i);
      expect(screen.getByLabelText(/instrument name/i)).toHaveValue("");

      unmount();
    });

    it("displays a 'login reqired' message when logged out", async () => {
      useAuth.mockReturnValue(UNAUTHENTICATED);
      const { unmount } = renderWithRouter(<App />, "/instruments/new/");

      expect(screen.getByText(/need to log ?in/i)).toBeInTheDocument();
      expect(
        screen.queryByLabelText(/instrument name/i)
      ).not.toBeInTheDocument();

      unmount();
    });

    it("displays loading text when auth state is LOADING", () => {
      useAuth.mockReturnValue(LOADING);
      const { unmount } = renderWithRouter(<App />, "/instruments/new/");

      expect(screen.queryByText(/loading/i)).toBeInTheDocument();

      unmount();
    });
  });
});

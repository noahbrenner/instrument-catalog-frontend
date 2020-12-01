import { screen, waitFor } from "@testing-library/react";
import React from "react";

import { App } from "#src/App";
import { renderWithRouter } from "../helpers/renderWithRouter";

function waitForPageLoad() {
  return waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
}

describe("src/pages/instrument.tsx rendered inside <App />", () => {
  describe("given the canonical path for an instrument", () => {
    const paths = ["/instruments/0/Flute/", "/instruments/4/Double%20Bass/"];

    it.each(paths)("does not modify the path %s", async (path) => {
      const { history } = renderWithRouter(<App />, path);
      await waitForPageLoad();
      expect(history.location.pathname).toBe(path);
    });
  });

  describe("given missing or extra characters in a path", () => {
    const canonicalPath = "/instruments/0/Flute/";
    const redirectablePaths = [
      "/instruments/0",
      "/instruments/0/",
      "/instruments/0/Flute",
      "/instruments/0/Flute/foo/",
    ];

    it.each(redirectablePaths)(
      `redirects %s to ${canonicalPath}`,
      async (path) => {
        const { history } = renderWithRouter(<App />, path);
        await waitForPageLoad();
        expect(history.location.pathname).toBe(canonicalPath);
      }
    );
  });

  describe("given a non-existent instrument ID", () => {
    const badPaths = [
      "/instruments/Flute/",
      "/instruments/-2/",
      "/instruments/7000/", // Can exist, but it's not in our mock data
    ];

    it.each(badPaths)("displays the 404 error page for %s", async (path) => {
      renderWithRouter(<App />, path);
      await waitForPageLoad();
      const heading2 = screen.getByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent(/404/i);
    });
  });

  describe("given a navigation from an invalid path to a valid path", () => {
    // This would fail if the component's state were not reset when navigating
    it("renders data for the valid path", async () => {
      const { history } = renderWithRouter(<App />, "/instruments/badPath/");
      await waitForPageLoad();
      await history.navigate("/instruments/0/Flute/");

      await waitFor(() => {
        const heading2 = screen.queryByRole("heading", { level: 2 });
        expect(heading2).toHaveTextContent(/flute/i);
      });
    });
  });

  describe("given a navigation from one valid path to another", () => {
    // This would fail if the component's state were not reset when navigating
    it("renders data for the second path", async () => {
      const { history } = renderWithRouter(<App />, "/instruments/0/Flute/");
      await waitForPageLoad();
      await history.navigate("/instruments/4/Double%20Bass/");

      await waitFor(() => {
        const heading2 = screen.queryByRole("heading", { level: 2 });
        expect(heading2).toHaveTextContent(/double bass/i);
      });
    });
  });
});

import { screen, waitFor } from "@testing-library/react";
import React from "react";

import { App } from "#src/App";
import { rest, server, ENDPOINTS, HEADERS } from "#test_helpers/server";
import { renderWithRouter } from "../helpers/renderWithRouter";

describe("<App />", () => {
  describe("given the route '/'", () => {
    it("displays content from Home page", async () => {
      renderWithRouter(<App />, "/");

      const heading1 = screen.getByRole("heading", { level: 1 });
      expect(heading1).toHaveTextContent(/instrument catalog/i);

      const heading2 = screen.getByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent(/browse by category/i);

      // Wait for the AJAX request to finish before unmounting to avoid an error
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("given the route '/does-not-exist/'", () => {
    it("displays the 404 error page", () => {
      renderWithRouter(<App />, "/does-not-exist/");
      const heading2 = screen.getByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent(/404/i);
    });
  });

  describe("given the route '/categories/'", () => {
    it("displays content from Categories page", async () => {
      renderWithRouter(<App />, "/categories/");

      const heading2 = screen.getByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent(/categories/i);

      // Wait for the AJAX request to finish before unmounting to avoid an error
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("given the route '/categories/strings/'", () => {
    it("displays content for the Strings Category page", async () => {
      renderWithRouter(<App />, "/categories/strings/");

      const heading2 = await screen.findByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent(/strings/i);

      // Wait for the AJAX request to finish before unmounting to avoid an error
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("given the route '/categories/strings/' and a server error", () => {
    it("displays an error message", async () => {
      server.use(
        rest.get(`${ENDPOINTS.categories}/strings`, (_req, res, ctx) => {
          return res(ctx.set(HEADERS), ctx.status(500, "Server error"));
        })
      );

      renderWithRouter(<App />, "/categories/strings/");

      await waitFor(
        () => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(),
        { timeout: 2000 }
      );

      expect(screen.getByText(/500 server error/i)).toBeInTheDocument();
    });
  });

  describe("given the route '/categories/fake-category/'", () => {
    it("displays the 404 error page", async () => {
      renderWithRouter(<App />, "/categories/fake-category/");

      const heading2 = await screen.findByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent(/404/i);
    });
  });
});

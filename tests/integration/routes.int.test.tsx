import { screen, waitFor } from "@testing-library/react";
import React from "react";
import { setupServer } from "msw/node";

import { App } from "#src/App";
import { renderWithRouter } from "../helpers/renderWithRouter";
import { handlers } from "#server_routes.mock";

const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("App", () => {
  describe("given the route '/'", () => {
    it("displays content from Home page", async () => {
      renderWithRouter(<App />, "/");
      expect(screen.getByRole("heading")).toHaveTextContent(
        /welcome to react-static/i
      );
      // Wait for the AJAX request to finish before unmounting to avoid an error
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("given the route '/about'", () => {
    it("displays content from About page", () => {
      renderWithRouter(<App />, "/about");
      expect(screen.getByText(/generator for react/i)).toBeInTheDocument();
    });
  });

  describe("given the route '/dynamic'", () => {
    it("displays content from Dynamic page", () => {
      renderWithRouter(<App />, "/dynamic");
      expect(screen.getByText(/a dynamic page/i)).toBeInTheDocument();
    });
  });
});

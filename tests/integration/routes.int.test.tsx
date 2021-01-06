import { screen } from "@testing-library/react";
import React, { createContext } from "react";

import { useAuth, UNAUTHENTICATED, AUTHENTICATED } from "#mocks/useAuth";
import { App } from "#src/App";
import { rest, server, ENDPOINTS } from "#test_helpers/server";
import { renderWithRouter } from "../helpers/renderWithRouter";

// Mock Auth0Provider as a noop
jest.mock("@auth0/auth0-react", () => ({
  Auth0Provider: createContext(undefined).Provider,
}));

describe("<App />", () => {
  describe.each([
    ["logged out", UNAUTHENTICATED],
    ["logged in", AUTHENTICATED],
  ])("when %s", (_, AUTH_VALUE) => {
    beforeEach(() => {
      useAuth.mockReturnValue(AUTH_VALUE);
    });

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

    describe("given the route '/categories/strings/' and a server error", () => {
      it("displays an error message", async () => {
        server.use(
          rest.get(`${ENDPOINTS.categories}/strings`, (_req, res, ctx) => {
            return res(ctx.status(500, "Server error"));
          })
        );
        renderWithRouter(<App />, "/categories/strings/");

        expect(
          await screen.findByText(/500 Server error/, {}, { timeout: 2000 })
        ).toBeInTheDocument();
      });
    });

    describe("given the route '/categories/fake-category/'", () => {
      it("displays the 404 error page", async () => {
        renderWithRouter(<App />, "/categories/fake-category/");

        const heading2 = await screen.findByRole("heading", { level: 2 });
        expect(heading2).toHaveTextContent(/404/);
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

    describe("given the route '/instruments/0/Flute/'", () => {
      it("displays the Flute Instrument page", async () => {
        const { unmount } = renderWithRouter(<App />, "/instruments/0/Flute/");

        const heading2 = await screen.findByRole("heading", { level: 2 });
        expect(heading2).toHaveTextContent(/Flute/);

        unmount();
      });
    });

    describe("given the route '/instruments/0/Flute/edit/'", () => {
      it("displays the Flute Edit Instrument page", async () => {
        const { unmount } = renderWithRouter(
          <App />,
          "/instruments/0/Flute/edit/"
        );

        const heading2 = await screen.findByRole("heading", { level: 2 });
        expect(heading2).toHaveTextContent(/edit instrument.*flute/i);

        unmount();
      });
    });
  });
});

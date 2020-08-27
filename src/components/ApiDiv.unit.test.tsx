import { render, screen } from "@testing-library/react";
import React from "react";
import { rest } from "msw";
import { setupServer } from "msw/node";

import { ApiDiv } from "./ApiDiv";

const { API_ROOT } = process.env;

const server = setupServer(
  rest.get(`${API_ROOT}/users/all`, (_req, res, ctx) => {
    return res(
      ctx.set("Access-Control-Allow-Origin", "*"),
      ctx.json({ users: [{ name: "Fooname", id: "1337" }] })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("ApiDiv", () => {
  describe("given successfull API call", () => {
    it("displays loading message, then response content", async () => {
      render(<ApiDiv />);

      // Initial render
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // After API response
      expect(await screen.findByText(/users/i)).toBeInTheDocument();
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  describe("given failed API call", () => {
    it("displays failure message", async () => {
      server.use(
        rest.get(`${API_ROOT}/users/all`, (_req, res) => {
          return res.networkError("Fail");
        })
      );
      render(<ApiDiv />);
      await screen.findByText(/failed/i);
    });
  });
});

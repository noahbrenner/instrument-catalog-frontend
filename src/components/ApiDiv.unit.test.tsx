import { render, screen } from "@testing-library/react";
import React from "react";

import { rest, server, ENDPOINTS, MOCK_DATA } from "#test_helpers/server";
import { ApiDiv } from "./ApiDiv";

describe("<ApiDiv />", () => {
  describe("given successfull API call", () => {
    it("displays loading message, then response content", async () => {
      render(<ApiDiv />);

      // Initial render
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // After API response
      expect(
        await screen.findByText(MOCK_DATA.users[0].name, { exact: false })
      ).toBeInTheDocument();
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  describe("given failed API call", () => {
    it("displays failure message", async () => {
      server.use(
        rest.get(ENDPOINTS.users, (_req, res) => res.networkError("Net fail"))
      );
      render(<ApiDiv />);
      await screen.findByText(/failed/i);
    });
  });
});

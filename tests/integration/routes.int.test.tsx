import { screen } from "@testing-library/react";
import React from "react";

import { App } from "../../src/App";
import { renderWithRouter } from "../helpers/renderWithRouter";

describe("App", () => {
  describe("given the route '/dynamic'", () => {
    it("displays content from Dynamic page", async () => {
      renderWithRouter(<App />, "/dynamic");
      expect(await screen.findByText(/a dynamic page/i)).toBeInTheDocument();
    });
  });
});

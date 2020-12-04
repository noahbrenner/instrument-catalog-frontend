import { render, screen } from "@testing-library/react";
import React from "react";

import { Instrument } from "./Instrument";

describe("<Instrument />", () => {
  describe("given required props", () => {
    it("renders the provided props", () => {
      render(
        <Instrument
          name="Foo"
          summary="My Foo summary"
          description="My description of Foo"
          imageUrl="http://foo.com/"
        />
      );

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "http://foo.com/");
      expect(img).toHaveAttribute("alt", "Foo");

      const heading2 = screen.getByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent("Foo");

      expect(screen.getByText("My Foo summary")).toBeInTheDocument();
      expect(screen.getByText("My description of Foo")).toBeInTheDocument();
    });
  });
});

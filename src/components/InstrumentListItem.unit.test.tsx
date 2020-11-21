import { render, screen } from "@testing-library/react";
import React from "react";

import { InstrumentListItem } from "./InstrumentListItem";

describe("<InstrumentListItem />", () => {
  describe("given required props", () => {
    it("renders the provided props", () => {
      render(<InstrumentListItem id={7} name="Foo" summary="My Foo summary" />);

      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        "Foo"
      );
      expect(screen.getByText("My Foo summary")).toBeInTheDocument();
      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        "/instruments/7/Foo/"
      );
    });
  });

  describe("given an instrument name containing spaces", () => {
    it("URL-encodes spaces for the rendered link's href", () => {
      render(<InstrumentListItem id={7} name="Foo Bar" summary="summary" />);

      const link = screen.getByRole("link");
      expect(link).toHaveTextContent("Foo Bar");
      expect(link).toHaveAttribute("href", "/instruments/7/Foo%20Bar/");
    });
  });
});

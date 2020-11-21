import { render, screen } from "@testing-library/react";
import React from "react";

import { CategoryDetail } from "./CategoryDetail";

describe("<CateogryDetail />", () => {
  describe("given required props", () => {
    it("renders the provided props", () => {
      render(
        <CategoryDetail
          name="Foo"
          summary="My Foo summary"
          description="My description of Foo"
        />
      );
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Foo"
      );
      expect(screen.getByText("My Foo summary")).toBeInTheDocument();
      expect(screen.getByText("My description of Foo")).toBeInTheDocument();
    });
  });
});

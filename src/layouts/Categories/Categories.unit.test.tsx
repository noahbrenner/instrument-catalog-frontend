import { render, screen } from "@testing-library/react";
import React from "react";

import type { ICategory } from "#src/types";
import { Categories } from "./Categories";

const MESSAGE = "I'm loading";

const CATEGORY1: ICategory = {
  id: 0,
  name: "Foo",
  slug: "foo",
  summary: "Foo summary",
  description: "A description of Foo",
} as const;

const CATEGORY2: ICategory = {
  id: 1,
  name: "Bar",
  slug: "bar",
  summary: "Bar summary",
  description: "A description of Bar",
} as const;

describe("<Categories />", () => {
  describe("given 0 category objects", () => {
    it("renders a loading message if provided", () => {
      render(<Categories categories={[]} loadingMessage="I'm loading" />);
      expect(screen.getByText("I'm loading")).toBeInTheDocument();
    });

    it('renders "No categories" if no loading message is provided', () => {
      render(<Categories categories={[]} />);
      expect(
        screen.getByText(/no categories have been defined/i)
      ).toBeInTheDocument();
    });
  });

  describe("given 1 category object", () => {
    it("renders the category", () => {
      render(<Categories categories={[CATEGORY1]} loadingMessage={MESSAGE} />);
      // We're only testing that <Category /> is rendered, not testing all props
      expect(screen.getByText(CATEGORY1.description)).toBeInTheDocument();
    });

    it("does NOT render any loading message", () => {
      // Pass a loading message
      const { rerender } = render(
        <Categories categories={[CATEGORY1]} loadingMessage={MESSAGE} />
      );
      expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument();

      // Pass no loading message
      rerender(<Categories categories={[CATEGORY1]} />);
      expect(
        screen.queryByText(/no categories have been defined/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("given 2 category objects", () => {
    it("renders both categories", () => {
      render(
        <Categories
          categories={[CATEGORY1, CATEGORY2]}
          loadingMessage={MESSAGE}
        />
      );

      // We're only testing that <Category /> is rendered, not testing all props
      expect(screen.getByText(CATEGORY1.description)).toBeInTheDocument();
      expect(screen.getByText(CATEGORY2.description)).toBeInTheDocument();
    });

    it("does NOT render any loading message", () => {
      // Pass a loading message
      const { rerender } = render(
        <Categories
          categories={[CATEGORY1, CATEGORY2]}
          loadingMessage={MESSAGE}
        />
      );
      expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument();

      // Pass no loading message
      rerender(<Categories categories={[CATEGORY1, CATEGORY2]} />);
      expect(
        screen.queryByText(/no categories have been defined/i)
      ).not.toBeInTheDocument();
    });
  });
});

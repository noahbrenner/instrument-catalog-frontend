import { render, screen } from "@testing-library/react";
import React from "react";

import type { ICategory } from "#src/types";
import { Categories } from "./Categories";

const MESSAGE = "I'm loading";

const CATEGORY1: ICategory = {
  id: 0,
  name: "Foo",
  slug: "foo",
  itemCount: 5,
  summary: "Foo summary",
  description: "A description of Foo",
} as const;

const CATEGORY2: ICategory = {
  id: 1,
  name: "Bar",
  slug: "bar",
  itemCount: 7,
  summary: "Bar summary",
  description: "A description of Bar",
} as const;

describe("<Categories />", () => {
  describe("given 0 category objects", () => {
    it("renders the loading message", () => {
      render(<Categories categories={[]} loadingMessage="I'm loading" />);
      expect(screen.getByText("I'm loading")).toBeInTheDocument();
    });
  });

  describe("given 1 category object", () => {
    it("renders the category", () => {
      render(<Categories categories={[CATEGORY1]} loadingMessage={MESSAGE} />);
      // We're only testing that <Category /> is rendered, not testing all props
      expect(screen.getByText(CATEGORY1.description)).toBeInTheDocument();
    });

    it("does NOT render the loading message", () => {
      render(<Categories categories={[CATEGORY1]} loadingMessage={MESSAGE} />);
      expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument();
    });
  });

  describe("given 2 category objects", () => {
    const categories = [CATEGORY1, CATEGORY2];

    it("renders both categories", () => {
      render(<Categories categories={categories} loadingMessage={MESSAGE} />);
      // We're only testing that <Category /> is rendered, not testing all props
      expect(screen.getByText(CATEGORY1.description)).toBeInTheDocument();
      expect(screen.getByText(CATEGORY2.description)).toBeInTheDocument();
    });

    it("does NOT render the loading message", () => {
      render(<Categories categories={categories} loadingMessage={MESSAGE} />);
      expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument();
    });
  });
});

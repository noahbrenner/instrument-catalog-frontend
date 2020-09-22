import { render, screen } from "@testing-library/react";
import React from "react";

import { Category } from "./Category";
import type { CategoryProps } from "./Category";

describe("<Category />", () => {
  describe("given all accepted props", () => {
    it("renders all provided data", () => {
      const props: Required<CategoryProps> = {
        name: "Foo",
        url: "/foo",
        itemCount: 3,
        summary: "Short description",
        description: "Longer description",
      };

      // eslint-disable-next-line react/jsx-props-no-spreading
      render(<Category {...props} />);

      expect(screen.getByRole("heading")).toHaveTextContent(props.name);
      expect(screen.getByRole("link")).toHaveAttribute("href", props.url);
      expect(
        screen.getByTitle(/instruments in this category/i)
      ).toHaveTextContent(String(props.itemCount));
      expect(screen.getByText(props.summary)).toBeInTheDocument();
      expect(screen.getByText(props.description)).toBeInTheDocument();
    });
  });

  describe("given no `description` prop", () => {
    it("does not render an empty <p /> for the missing description", () => {
      const { container } = render(
        <Category name="Foo" url="/" itemCount={1} summary="Bar" />
      );
      const paragraphs = container.querySelectorAll("p");
      paragraphs.forEach((p) => expect(p).not.toBeEmptyDOMElement());
    });
  });
});

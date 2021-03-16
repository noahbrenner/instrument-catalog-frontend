import { render, screen } from "@testing-library/react";
import React from "react";

import { CategoryListItem } from "./CategoryListItem";
import type { CategoryListItemProps } from "./CategoryListItem";

describe("<Category />", () => {
  describe("given all accepted props", () => {
    it("renders all provided data", () => {
      const props: Required<CategoryListItemProps> = {
        name: "Foo",
        url: "/foo",
        summary: "Short description",
        description: "Longer description",
      };

      // eslint-disable-next-line react/jsx-props-no-spreading
      render(<CategoryListItem {...props} />);

      expect(screen.getByRole("heading")).toHaveTextContent(props.name);
      expect(screen.getByRole("link")).toHaveAttribute("href", props.url);
      expect(screen.getByText(props.summary)).toBeInTheDocument();
      expect(screen.getByText(props.description)).toBeInTheDocument();
    });
  });

  describe("given no `description` prop", () => {
    it("does not render an empty <p /> for the missing description", () => {
      const { container } = render(
        <CategoryListItem name="Foo" url="/" summary="Bar" />
      );
      const paragraphs = container.querySelectorAll("p");
      paragraphs.forEach((p) => expect(p).not.toBeEmptyDOMElement());
    });
  });
});

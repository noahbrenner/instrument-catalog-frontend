import { render, screen } from "@testing-library/react";
import React from "react";

import { InstrumentForm } from "./InstrumentForm";

describe("<InstrumentForm />", () => {
  describe("given only required props", () => {
    it('renders a blank "New instrument" form', () => {
      render(<InstrumentForm userId="foo|123" />);
      // TODO Test for blank values
      const heading2 = screen.getByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent(/new instrument/i);
    });
  });

  describe("given all props", () => {
    it('renders a pre-filled "Edit instrument" form', () => {
      render(
        <InstrumentForm
          userId="foo|123"
          id={5}
          categoryId={2}
          name="Foo"
          summary="Foo summary"
          description="Foo description"
          imageUrl="https://example.com/foo.jpg"
        />
      );
      // TODO Test for values of other properties
      const heading2 = screen.getByRole("heading", { level: 2 });
      expect(heading2).toHaveTextContent(/edit instrument: foo/i);
    });
  });
});

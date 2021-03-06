import { render, screen } from "@testing-library/react";
import React from "react";

import { BurgerButton } from "./BurgerButton";

const noop = (): void => undefined;

// NOTE: We're not testing className or onClick props, since they're just
// applied directly to the component's root element.
describe("<BurgerButton />", () => {
  describe("given navIsVisible=true", () => {
    it("renders 'close menu' interface", () => {
      render(<BurgerButton navIsVisible onClick={noop} />);
      expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();
    });
  });

  describe("given navIsVisible=false", () => {
    it("renders 'open menu' interface", () => {
      render(<BurgerButton navIsVisible={false} onClick={noop} />);
      expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
    });
  });
});

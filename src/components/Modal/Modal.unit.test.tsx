import { render } from "@testing-library/react";
import React from "react";

import { Modal } from "./Modal";

describe("<Modal />", () => {
  it("renders children", () => {
    const { getByTestId } = render(
      <Modal>
        <div data-testid="foo" />
        <div data-testid="bar" />
      </Modal>
    );
    expect(getByTestId("foo")).toBeInTheDocument();
    expect(getByTestId("bar")).toBeInTheDocument();
  });
});

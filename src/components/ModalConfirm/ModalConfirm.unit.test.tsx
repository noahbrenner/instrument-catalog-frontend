import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ModalConfirm } from "./ModalConfirm";

describe("<ModalConfirm />", () => {
  it("renders children and attaches event handlers", () => {
    const handleYes = jest.fn();
    const handleNo = jest.fn();
    const { getByRole, getByText } = render(
      <ModalConfirm onYes={handleYes} onNo={handleNo}>
        Are you sure?
      </ModalConfirm>
    );

    expect(getByText("Are you sure?")).toBeInTheDocument();
    expect(handleYes).not.toBeCalled();
    expect(handleNo).not.toBeCalled();

    userEvent.click(getByRole("button", { name: /yes/i }));
    expect(handleYes).toBeCalled();
    expect(handleNo).not.toBeCalled();

    userEvent.click(getByRole("button", { name: /no/i }));
    expect(handleNo).toBeCalled();
  });

  it("allows setting custom button text", () => {
    const handleYes = jest.fn();
    const handleNo = jest.fn();
    const { getByRole } = render(
      <ModalConfirm
        yesText="Definitely!"
        noText="Absolutely Not!"
        onYes={handleYes}
        onNo={handleNo}
      >
        Are you sure?
      </ModalConfirm>
    );

    userEvent.click(getByRole("button", { name: "Definitely!" }));
    expect(handleYes).toBeCalled();

    userEvent.click(getByRole("button", { name: "Absolutely Not!" }));
    expect(handleNo).toBeCalled();
  });

  it("allows disabling 'yes' and 'no' buttons", () => {
    const handleYes = jest.fn();
    const handleNo = jest.fn();
    const { getByRole } = render(
      <ModalConfirm onYes={handleYes} onNo={handleNo} disableButtons>
        Are you sure?
      </ModalConfirm>
    );
    const yesButton = getByRole("button", { name: /yes/i });
    const noButton = getByRole("button", { name: /no/i });

    expect(yesButton).toBeDisabled();
    expect(noButton).toBeDisabled();

    userEvent.click(yesButton);
    expect(handleYes).not.toBeCalled();

    userEvent.click(noButton);
    expect(handleNo).not.toBeCalled();
  });
});

import userEvent from "@testing-library/user-event";
import React from "react";

import { renderWithRouter } from "#test_helpers/renderWithRouter";
import { EditInstrumentButton } from "./EditInstrumentButton";

describe("<EditInstrumentButton />", () => {
  it("navigates to the instrument's edit page when clicked", () => {
    const { history, getByRole } = renderWithRouter(
      <EditInstrumentButton id={7} name="Foo Bar" />,
      "/initial/path/"
    );

    expect(history.location.pathname).toBe("/initial/path/");
    userEvent.click(getByRole("button"));
    expect(history.location.pathname).toBe("/instruments/7/Foo%20Bar/edit/");
  });
});

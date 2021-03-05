import userEvent from "@testing-library/user-event";
import React from "react";

import { renderWithRouter } from "#test_helpers/renderWithRouter";
import { DeleteInstrumentButton } from "./DeleteInstrumentButton";

describe("<DeleteInstrumentButton />", () => {
  describe("If the deletion is confirmed", () => {
    it.skip("deletes the instrument and navigates to the home page", () => {
      const { history, getByRole } = renderWithRouter(
        <DeleteInstrumentButton id={0} name="Flute" />,
        "/initial/path/"
      );

      expect(history.location.pathname).toBe("/initial/path/");
      userEvent.click(getByRole("button"));

      // TODO Click confirm
      // TODO Verify instrument is deleted

      expect(history.location.pathname).toBe("/");
    });
  });

  describe("If the deletion is cancelled", () => {
    it.skip("does not delete the instrument or naviage", () => {
      const { history, getByRole } = renderWithRouter(
        <DeleteInstrumentButton id={0} name="Flute" />,
        "/initial/path/"
      );

      expect(history.location.pathname).toBe("/initial/path/");
      userEvent.click(getByRole("button"));

      // TODO Click cancel
      // TODO Verify instrument is not deleted

      expect(history.location.pathname).toBe("/initial/path/");
    });
  });
});

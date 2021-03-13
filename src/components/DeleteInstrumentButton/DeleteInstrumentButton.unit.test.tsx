import { waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import React from "react";

import {
  useAuth,
  mockAuthenticatedUser,
  ERRORED,
  LOADING,
  UNAUTHENTICATED,
} from "#mocks/useAuth";
import { renderWithRouter } from "#test_helpers/renderWithRouter";
import { rest, server, ENDPOINTS, MOCK_DATA } from "#test_helpers/server";
import { DeleteInstrumentButton } from "./DeleteInstrumentButton";

async function expectInstrumentToExist(instrumentId: number) {
  const url = `${ENDPOINTS.instruments}/${instrumentId}`;
  expect(await axios.get(url)).toHaveProperty("status", 200);
}

async function expectInstrumentNotToExist(instrumentId: number) {
  const url = `${ENDPOINTS.instruments}/${instrumentId}`;
  const axiosError = await axios.get(url).catch((e) => e);
  expect(axiosError).not.toHaveProperty("status");
  expect(axiosError).toHaveProperty(["response", "status"], 404);
}

function failApiCallOnce() {
  server.use(
    rest.delete(`${ENDPOINTS.instruments}/*`, (_req, res, ctx) => {
      return res.once(ctx.status(400));
    })
  );
}

describe("<DeleteInstrumentButton />", () => {
  describe("when a user confirms deletion", () => {
    it("deletes the instrument and navigates to the home page", async () => {
      const instrument = MOCK_DATA.instruments[0];
      mockAuthenticatedUser(instrument.userId);
      const { history, getByRole, getByText, queryByText } = renderWithRouter(
        <DeleteInstrumentButton id={instrument.id} name={instrument.name} />,
        "/initial/path/"
      );

      expect(history.location.pathname).toBe("/initial/path/");
      expect(queryByText(/are you sure/i)).not.toBeInTheDocument();
      userEvent.click(getByRole("button", { name: /delete instrument/i }));
      const modal = getByText(/are you sure/i);

      const yesButton = getByRole("button", { name: /yes/i });
      userEvent.click(yesButton);
      expect(yesButton).toBeDisabled();
      await waitForElementToBeRemoved(modal);

      expect(history.location.pathname).toBe("/");
      await expectInstrumentNotToExist(instrument.id);
    });

    it("succeeds when the instrument has already been deleted", async () => {
      // This behavior is dependent on the API response, but we'll document it
      mockAuthenticatedUser("foo|123");
      const instrumentId = 9001;
      const { history, getByRole, getByText, queryByText } = renderWithRouter(
        <DeleteInstrumentButton id={instrumentId} name="Foo" />,
        "/initial/path/"
      );

      await expectInstrumentNotToExist(instrumentId);

      expect(history.location.pathname).toBe("/initial/path/");
      expect(queryByText(/are you sure/i)).not.toBeInTheDocument();
      userEvent.click(getByRole("button", { name: /delete instrument/i }));
      const modal = getByText(/are you sure/i);

      const yesButton = getByRole("button", { name: /yes/i });
      userEvent.click(yesButton);
      expect(yesButton).toBeDisabled();
      await waitForElementToBeRemoved(modal);

      expect(history.location.pathname).toBe("/");
      await expectInstrumentNotToExist(instrumentId);
    });

    it("allows retrying if the API call fails", async () => {
      const instrument = MOCK_DATA.instruments[0];
      mockAuthenticatedUser(instrument.userId);
      const { getByRole, getByText } = renderWithRouter(
        <DeleteInstrumentButton id={instrument.id} name={instrument.name} />,
        "/initial/path/"
      );

      userEvent.click(getByRole("button", { name: /delete instrument/i }));
      expect(getByText(/are you sure/i)).toBeInTheDocument();
      const yesButton = getByRole("button", { name: /yes/i });

      // First attempt fails (after "are you sure?" prompt)
      failApiCallOnce();
      userEvent.click(yesButton);
      expect(yesButton).toBeDisabled();
      await waitFor(() => expect(yesButton).toBeEnabled());
      expect(getByText(/try.*again[?]/i)).toBeInTheDocument();
      await expectInstrumentToExist(instrument.id);

      // Second attempt fails (after "try again?" prompt)
      failApiCallOnce();
      userEvent.click(yesButton);
      expect(yesButton).toBeDisabled();
      await waitFor(() => expect(yesButton).toBeEnabled());
      expect(getByText(/try.*again[?]/i)).toBeInTheDocument();
      await expectInstrumentToExist(instrument.id);

      // Third attempt succeeds
      userEvent.click(yesButton);
      expect(yesButton).toBeDisabled();
      await waitForElementToBeRemoved(yesButton);
      await expectInstrumentNotToExist(instrument.id);
    });

    it("allows cancelling after retrying", async () => {
      const instrument = MOCK_DATA.instruments[0];
      mockAuthenticatedUser(instrument.userId);
      const { getByRole, getByText } = renderWithRouter(
        <DeleteInstrumentButton id={instrument.id} name={instrument.name} />,
        "/initial/path/"
      );

      userEvent.click(getByRole("button", { name: /delete instrument/i }));
      expect(getByText(/are you sure/i)).toBeInTheDocument();
      const yesButton = getByRole("button", { name: /yes/i });

      // First attempt fails (after "are you sure?" prompt)
      failApiCallOnce();
      userEvent.click(yesButton);
      expect(yesButton).toBeDisabled();
      await waitFor(() => expect(yesButton).toBeEnabled());
      expect(getByText(/try.*again[?]/i)).toBeInTheDocument();

      // Second attempt fails (after "try again?" prompt)
      failApiCallOnce();
      userEvent.click(yesButton);
      expect(yesButton).toBeDisabled();
      await waitFor(() => expect(yesButton).toBeEnabled());
      expect(getByText(/try.*again[?]/i)).toBeInTheDocument();

      // Third attempt is cancelled
      userEvent.click(getByRole("button", { name: /no/i }));
      expect(yesButton).not.toBeInTheDocument();
      await expectInstrumentToExist(instrument.id);
    });
  });

  describe("when a user cancels deletion", () => {
    it("does not delete the instrument or navigate", async () => {
      const instrument = MOCK_DATA.instruments[0];
      mockAuthenticatedUser(instrument.userId);
      const { history, getByRole, getByText, queryByText } = renderWithRouter(
        <DeleteInstrumentButton id={instrument.id} name={instrument.name} />,
        "/initial/path/"
      );

      expect(history.location.pathname).toBe("/initial/path/");
      expect(queryByText(/are you sure/i)).not.toBeInTheDocument();
      userEvent.click(getByRole("button", { name: /delete instrument/i }));
      expect(getByText(/are you sure/i)).toBeInTheDocument();

      userEvent.click(getByRole("button", { name: /no/i }));
      expect(queryByText(/are you sure/i)).not.toBeInTheDocument();

      expect(history.location.pathname).toBe("/initial/path/");
      await expectInstrumentToExist(instrument.id);
    });
  });

  describe("given a user who is not AUTHENTICATED", () => {
    it.each([
      ["ERRORED", ERRORED],
      ["LOADING", LOADING],
      ["UNAUTHENTICATED", UNAUTHENTICATED],
    ])("throws when rendered while auth state is %s", (_, authState) => {
      // Silence React's debugging output for this test
      const originalErrorFn = console.error; // eslint-disable-line no-console
      console.error = jest.fn(); // eslint-disable-line no-console

      useAuth.mockReturnValue(authState);
      expect(() => {
        renderWithRouter(<DeleteInstrumentButton id={1} name="Foo" />);
      }).toThrow(/should only be rendered when authenticated/i);

      console.error = originalErrorFn; // eslint-disable-line no-console
    });
  });
});

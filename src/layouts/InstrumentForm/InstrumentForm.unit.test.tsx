import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { mockAuthenticatedUser } from "#mocks/useAuth";
import { MOCK_DATA } from "#server_routes.mock";
import { renderWithRouter } from "#test_helpers/renderWithRouter";
import { InstrumentForm } from "./InstrumentForm";
import type {
  InstrumentFormElement,
  InstrumentFormProps,
} from "./InstrumentForm";

function renderInstrumentForm(props: InstrumentFormProps = {}) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  const utils = renderWithRouter(<InstrumentForm {...props} />);

  const form = utils.getByRole("form") as InstrumentFormElement;

  // This is a function because categories are populated async by an API request
  const getCategoryInputs = () => {
    return [
      ...form.querySelectorAll("input[name=categoryId]"),
    ] as HTMLInputElement[];
  };
  return {
    ...utils,
    form,
    heading: utils.getByRole("heading", { level: 2 }) as HTMLHeadingElement,
    nameInput: utils.getByLabelText(/instrument name/i) as HTMLInputElement,
    categoryFieldset: utils.getByRole("group", { name: /category/i }),
    getCategoryInputs,
    getCategoryInputByValue: (categoryId: number) => {
      const inputs = getCategoryInputs();
      const input = inputs.find(({ value }) => value === String(categoryId));
      if (input === undefined) {
        throw new Error(`No category input with value "${categoryId}"`);
      }
      return input;
    },
    summaryInput: utils.getByLabelText(/summary/i) as HTMLInputElement,
    descriptionTextarea: utils.getByLabelText(
      /description/i
    ) as HTMLTextAreaElement,
    imageUrlInput: utils.getByLabelText(/image url/i) as HTMLInputElement,
    submitButton: utils.getByText(/submit/i) as HTMLButtonElement,
    resetButton: utils.getByText(/reset/i) as HTMLButtonElement,
    waitForInitialLoad: () =>
      waitFor(() => expect(getCategoryInputs().length).toBeGreaterThan(0)),
  };
}

describe("<InstrumentForm />", () => {
  describe("given no props", () => {
    it('renders a blank "New instrument" form', async () => {
      mockAuthenticatedUser("foo|123");
      const utils = await renderInstrumentForm();
      await utils.waitForInitialLoad();

      const categoryInputs = utils.getCategoryInputs();

      expect(utils.heading).toHaveTextContent(/new instrument/i);
      expect(utils.nameInput).toHaveValue("");
      expect(categoryInputs.length).toBeGreaterThan(0);
      categoryInputs.forEach((input) => expect(input).not.toBeChecked());
      expect(utils.summaryInput).toHaveValue("");
      expect(utils.descriptionTextarea).toHaveValue("");
      expect(utils.imageUrlInput).toHaveValue("");
    });
  });

  describe("given all props", () => {
    it('renders a pre-filled "Edit instrument" form', async () => {
      mockAuthenticatedUser("foo|123");
      const props = {
        id: 5,
        categoryId: 2,
        name: "Foo",
        summary: "Foo summary",
        description: "Foo description",
        imageUrl: "https://example.com/foo.jpg",
      };
      const utils = renderInstrumentForm(props);
      await utils.waitForInitialLoad();

      expect(utils.heading).toHaveTextContent(/edit instrument: foo/i);
      expect(utils.nameInput).toHaveValue(props.name);
      expect(utils.getCategoryInputByValue(props.categoryId)).toBeChecked();
      expect(utils.summaryInput).toHaveValue(props.summary);
      expect(utils.descriptionTextarea).toHaveValue(props.description);
      expect(utils.imageUrlInput).toHaveValue(props.imageUrl);
    });
  });

  describe("given a form submission", () => {
    test("Edit Instrument happy path works", async () => {
      const clearAndType: typeof userEvent.type = (element, text, opts) => {
        userEvent.clear(element);
        return userEvent.type(element, text, opts);
      };

      const instrument = MOCK_DATA.instruments[4];
      mockAuthenticatedUser(instrument.userId);
      const setInstrument = jest.fn();
      const utils = renderInstrumentForm({ ...instrument, setInstrument });
      const formElements = [
        utils.nameInput,
        utils.categoryFieldset,
        utils.summaryInput,
        utils.descriptionTextarea,
        utils.imageUrlInput,
        utils.submitButton,
        utils.resetButton,
      ];
      await utils.waitForInitialLoad();

      clearAndType(utils.nameInput, "Bar");
      userEvent.click(utils.getCategoryInputByValue(1));
      clearAndType(utils.summaryInput, "Bar summary");
      clearAndType(utils.descriptionTextarea, "Bar description");
      clearAndType(utils.imageUrlInput, "https://example.com/foo.jpg");
      userEvent.click(utils.submitButton);

      // Inputs are disabled when the form is submitted
      formElements.forEach((element) => expect(element).toBeDisabled());

      // Inputs are enabled when the form submission completes
      await waitFor(() => expect(utils.nameInput).toBeEnabled());
      formElements.forEach((element) => expect(element).toBeEnabled());

      // State is updated via the setInstrument prop function
      expect(setInstrument).toBeCalledWith({
        id: instrument.id,
        categoryId: 1,
        name: "Bar",
        summary: "Bar summary",
        description: "Bar description",
        imageUrl: "https://example.com/foo.jpg",
        userId: instrument.userId,
      });

      // App is navigated to the view page using the new instrument name
      expect(utils.history.location.pathname).toBe(
        `/instruments/${instrument.id}/Bar/`
      );
    });

    test("Edit form error path works", async () => {
      const instrument = MOCK_DATA.instruments[4];
      mockAuthenticatedUser(`${instrument.userId}notTheOwner`);
      const setInstrument = jest.fn();
      const utils = renderInstrumentForm({ ...instrument, setInstrument });
      const initialPathname = utils.history.location.pathname;
      await utils.waitForInitialLoad();

      userEvent.type(utils.nameInput, "Baz");
      userEvent.click(utils.submitButton);

      // Inputs are re-enabled when the form submission completes
      expect(utils.nameInput).toBeDisabled();
      await waitFor(() => expect(utils.nameInput).toBeEnabled());

      expect(setInstrument).not.toBeCalled();
      expect(utils.history.location.pathname).toBe(initialPathname);
    });
  });
});

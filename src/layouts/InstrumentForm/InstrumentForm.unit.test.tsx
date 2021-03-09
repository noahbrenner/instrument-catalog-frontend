import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { mockAuthenticatedUser } from "#mocks/useAuth";
import { renderWithRouter } from "#test_helpers/renderWithRouter";
import { ENDPOINTS, MOCK_DATA, rest, server } from "#test_helpers/server";
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
    descriptionTextarea: utils.getByRole("textbox", { name: /description/i }),
    imageUrlInput: utils.getByLabelText(/image url/i) as HTMLInputElement,
    submitButton: utils.getByText(/submit/i) as HTMLButtonElement,
    resetButton: utils.getByText(/reset/i) as HTMLButtonElement,
    clickConfirmResetButton: () =>
      userEvent.click(utils.getByRole("button", { name: /yes/i })),
    clickCancelResetButton: () =>
      userEvent.click(utils.getByRole("button", { name: /no/i })),
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
      const windsRadioButton = utils.getByRole("radio", { name: "Winds" });

      const assertFormFieldsHaveInitialBlankValues = () => {
        expect(utils.heading).toHaveTextContent(/new instrument/i);
        expect(utils.nameInput).toHaveValue("");
        categoryInputs.forEach((input) => expect(input).not.toBeChecked());
        expect(utils.summaryInput).toHaveValue("");
        expect(utils.descriptionTextarea).toHaveValue("");
        expect(utils.imageUrlInput).toHaveValue("");
      };

      assertFormFieldsHaveInitialBlankValues();

      // Enter values
      userEvent.type(utils.nameInput, "Foo");
      userEvent.click(windsRadioButton);
      userEvent.type(utils.summaryInput, "Foo summary");
      userEvent.type(utils.descriptionTextarea, "Foo description");
      userEvent.type(utils.imageUrlInput, "https://example.com/foo.jpg");

      // Begin reset flow, but cancel it
      expect(utils.queryByText(/are you sure/i)).not.toBeInTheDocument();
      userEvent.click(utils.resetButton);
      expect(utils.getByText(/are you sure/i)).toBeInTheDocument();
      utils.clickCancelResetButton();
      expect(utils.queryByText(/are you sure/i)).not.toBeInTheDocument();
      // Form fields still have inserted values
      expect(utils.nameInput).toHaveValue("Foo");
      expect(windsRadioButton).toBeChecked();
      expect(utils.summaryInput).toHaveValue("Foo summary");
      expect(utils.descriptionTextarea).toHaveValue("Foo description");
      expect(utils.imageUrlInput).toHaveValue("https://example.com/foo.jpg");

      // Begin and complete reset flow
      userEvent.click(utils.resetButton);
      expect(utils.getByText(/are you sure/i)).toBeInTheDocument();
      utils.clickConfirmResetButton();
      expect(utils.queryByText(/are you sure/i)).not.toBeInTheDocument();
      assertFormFieldsHaveInitialBlankValues();
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

      const initialCategoryRadioButton = utils.getCategoryInputByValue(2);
      const newCategoryRadioButton = utils.getCategoryInputByValue(0);

      const assertFormFieldsHaveInitialValues = () => {
        expect(utils.heading).toHaveTextContent(/edit instrument: foo/i);
        expect(utils.nameInput).toHaveValue(props.name);
        expect(initialCategoryRadioButton).toBeChecked();
        expect(utils.summaryInput).toHaveValue(props.summary);
        expect(utils.descriptionTextarea).toHaveValue(props.description);
        expect(utils.imageUrlInput).toHaveValue(props.imageUrl);
      };

      assertFormFieldsHaveInitialValues();

      // Enter values; Text values will be *appended*
      userEvent.type(utils.nameInput, "AAA");
      userEvent.click(newCategoryRadioButton);
      userEvent.type(utils.summaryInput, "BBB");
      userEvent.type(utils.descriptionTextarea, "CCC");
      userEvent.type(utils.imageUrlInput, "DDD");

      // Begin reset flow, but cancel it
      expect(utils.queryByText(/are you sure/i)).not.toBeInTheDocument();
      userEvent.click(utils.resetButton);
      expect(utils.getByText(/are you sure/i)).toBeInTheDocument();
      utils.clickCancelResetButton();
      expect(utils.queryByText(/are you sure/i)).not.toBeInTheDocument();
      // Form fields still have inserted values
      expect(utils.nameInput).toHaveValue("FooAAA");
      expect(newCategoryRadioButton).toBeChecked();
      expect(utils.summaryInput).toHaveValue("Foo summaryBBB");
      expect(utils.descriptionTextarea).toHaveValue("Foo descriptionCCC");
      expect(utils.imageUrlInput).toHaveValue("https://example.com/foo.jpgDDD");

      // Begin and complete reset flow
      userEvent.click(utils.resetButton);
      expect(utils.getByText(/are you sure/i)).toBeInTheDocument();
      utils.clickConfirmResetButton();
      expect(utils.queryByText(/are you sure/i)).not.toBeInTheDocument();
      assertFormFieldsHaveInitialValues();
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

      // Enter values; Text includes whitespace which should be trimmed
      clearAndType(utils.nameInput, "  Bar  ");
      userEvent.click(utils.getCategoryInputByValue(1));
      clearAndType(utils.summaryInput, "  Bar summary  ");
      clearAndType(utils.descriptionTextarea, "  Bar description  ");
      clearAndType(utils.imageUrlInput, "  https://example.com/foo.jpg  ");
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
      const error = "You can't do that";
      server.use(
        rest.put(`${ENDPOINTS.instruments}/*`, (_req, res, ctx) =>
          // `res.once` so that request #2 gets the default implementation
          res.once(ctx.status(403, "Forbidden"), ctx.json({ error }))
        )
      );
      const instrument = MOCK_DATA.instruments[0];
      mockAuthenticatedUser(instrument.userId);
      const setInstrument = jest.fn();
      const utils = renderInstrumentForm({ ...instrument, setInstrument });
      const initialPathname = utils.history.location.pathname;
      await utils.waitForInitialLoad();

      // Form submission 1: Error response from API
      userEvent.type(utils.nameInput, "Baz");
      userEvent.click(utils.submitButton);

      expect(utils.nameInput).toBeDisabled(); // Until form submission response
      await waitFor(() => expect(utils.nameInput).toBeEnabled());

      expect(setInstrument).not.toBeCalled();
      expect(utils.getByText(error)).toBeInTheDocument();
      expect(utils.history.location.pathname).toBe(initialPathname);

      // Form submission 2: Successful response from API
      userEvent.click(utils.submitButton);

      expect(utils.queryByText(error)).not.toBeInTheDocument();
      expect(utils.nameInput).toBeDisabled(); // Until form submission response
      await waitFor(() => expect(utils.nameInput).toBeEnabled());

      expect(setInstrument).toBeCalledWith({
        ...instrument,
        name: `${instrument.name}Baz`,
      });
      expect(utils.history.location.pathname).toBe(
        `/instruments/${instrument.id}/${instrument.name}Baz/`
      );
    });
  });
});

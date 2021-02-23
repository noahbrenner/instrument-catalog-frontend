import { render, waitFor } from "@testing-library/react";
import React from "react";

import { InstrumentForm } from "./InstrumentForm";
import type {
  InstrumentFormElements,
  InstrumentFormProps,
} from "./InstrumentForm";

function renderInstrumentForm(props: InstrumentFormProps = {}) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  const utils = render(<InstrumentForm {...props} />);

  const form = utils.getByRole("form") as HTMLFormElement;

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
    formElements: form.elements as InstrumentFormElements,
    nameInput: utils.getByLabelText(/instrument name/i) as HTMLInputElement,
    getCategoryInputs,
    getCategoryInputByValue: (catId: number) =>
      getCategoryInputs().find((input) => input.value === String(catId)),
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
});

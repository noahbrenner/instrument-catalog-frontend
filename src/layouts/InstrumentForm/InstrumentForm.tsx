import type { RouteComponentProps } from "@reach/router";
import React, { useRef, useState } from "react";
import type { FormEvent } from "react";

import { useCategories } from "#hooks/useCategories";
import type { IInstrument } from "#src/types";

export interface InstrumentFormElements extends HTMLFormControlsCollection {
  categoryId: RadioNodeList;
  name: HTMLInputElement;
  summary: HTMLInputElement;
  description: HTMLTextAreaElement;
  imageUrl: HTMLInputElement;
}

type InstrumentFormValues = Omit<IInstrument, "id" | "userId">;

const FORM_IDS: {
  readonly [key in keyof InstrumentFormValues | "heading"]: string;
} = {
  heading: "instrumentForm:heading",
  categoryId: "instrumentForm:categoryId",
  name: "instrumentForm:name",
  summary: "instrumentForm:summary",
  description: "instrumentForm:description",
  imageUrl: "instrumentForm:imageUrl",
} as const;

export type InstrumentFormProps = Partial<Omit<IInstrument, "userId">>;

export function InstrumentForm({
  id = undefined,
  categoryId = -1,
  name = "",
  summary = "",
  description = "",
  imageUrl = "",
}: InstrumentFormProps & RouteComponentProps): JSX.Element {
  const form = useRef<HTMLFormElement>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const { categories } = useCategories();
  const canSubmitForm = categories.length > 0 && !isFormSubmitting;

  // TODO `const isNewInstrument = id === undefined` when TS can save typechecks
  // https://github.com/microsoft/TypeScript/issues/12184

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmitForm) {
      return;
    }

    setIsFormSubmitting(true);
    const formInputs = event.currentTarget.elements as InstrumentFormElements;
    const formValues: InstrumentFormValues = {
      categoryId: Number(formInputs.categoryId.value),
      name: formInputs.name.value,
      summary: formInputs.summary.value,
      description: formInputs.description.value,
      imageUrl: formInputs.imageUrl.value,
    };

    if (id === undefined) {
      console.dir({ newInstrument: formValues });
    } else {
      console.dir({ id, updatedInstrument: formValues });
    }
  };

  const handleReset = () => {
    if (form.current && window.confirm("Are you sure you want to reset?")) {
      form.current.reset();
    }
  };

  return (
    <>
      {id === undefined ? (
        <h2 id={FORM_IDS.heading}>New instrument</h2>
      ) : (
        <h2 id={FORM_IDS.heading}>
          Edit instrument:{" "}
          <Link to={getInstrumentPath({ name, id })}>{name}</Link>
        </h2>
      )}
      <form
        ref={form}
        onSubmit={handleSubmit}
        aria-labelledby={FORM_IDS.heading}
      >
        <p>
          <label htmlFor={FORM_IDS.name}>
            Instrument name
            <input
              type="text"
              name="name"
              id={FORM_IDS.name}
              defaultValue={name}
              disabled={isFormSubmitting}
            />
          </label>
        </p>
        <fieldset disabled={isFormSubmitting}>
          <legend>Category</legend>
          {categories.map((cat) => (
            <p key={cat.id}>
              <label htmlFor={FORM_IDS.categoryId + cat.id}>
                <input
                  type="radio"
                  name="categoryId"
                  id={FORM_IDS.categoryId + cat.id}
                  value={cat.id}
                  defaultChecked={cat.id === categoryId}
                />
                {cat.name}
              </label>
            </p>
          ))}
        </fieldset>
        <p>
          <label htmlFor={FORM_IDS.summary}>
            Summary
            <input
              type="text"
              name="summary"
              id={FORM_IDS.summary}
              defaultValue={summary}
              disabled={isFormSubmitting}
            />
          </label>
        </p>
        <div>
          <label htmlFor={FORM_IDS.description}>
            Description
            <textarea
              name="description"
              id={FORM_IDS.description}
              defaultValue={description}
              cols={30}
              rows={10}
              disabled={isFormSubmitting}
            />
          </label>
        </div>
        <p>
          <label htmlFor={FORM_IDS.imageUrl}>
            Image URL
            <input
              type="text"
              name="imageUrl"
              id={FORM_IDS.imageUrl}
              defaultValue={imageUrl}
              disabled={isFormSubmitting}
            />
          </label>
        </p>
        <button type="submit" disabled={!canSubmitForm}>
          Submit
        </button>
        <button type="button" onClick={handleReset} disabled={isFormSubmitting}>
          Reset
        </button>
      </form>
    </>
  );
}

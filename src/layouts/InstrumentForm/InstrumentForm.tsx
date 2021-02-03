import type { RouteComponentProps } from "@reach/router";
import React, { useRef, useState } from "react";
import type { FormEvent } from "react";

import { useCategories } from "#hooks/useCategories";
import type { IInstrument } from "#src/types";

interface InstrumentFormInputs extends HTMLFormControlsCollection {
  categoryId: HTMLInputElement;
  name: HTMLInputElement;
  summary: HTMLInputElement;
  description: HTMLTextAreaElement;
  imageUrl: HTMLInputElement;
}

type InstrumentFormValues = Omit<IInstrument, "id" | "userId">;

const INPUT_IDS: { readonly [key in keyof InstrumentFormValues]: string } = {
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

  // TODO `const isNewInstrument = id === undefined` when TS can save typechecks
  // https://github.com/microsoft/TypeScript/issues/12184

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsFormSubmitting(true);

    const formInputs = event.currentTarget.elements as InstrumentFormInputs;
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
        <h2>New instrument</h2>
      ) : (
        <h2>Edit instrument: {name}</h2>
      )}
      <form ref={form} action="" onSubmit={handleSubmit}>
        <p>
          <label htmlFor={INPUT_IDS.name}>
            Instrument name
            <input
              type="text"
              name="name"
              id={INPUT_IDS.name}
              defaultValue={name}
              disabled={isFormSubmitting}
            />
          </label>
        </p>
        <fieldset disabled={isFormSubmitting}>
          <legend>Category</legend>
          {categories.map((cat) => (
            <p key={cat.id}>
              <label htmlFor={INPUT_IDS.categoryId + cat.id}>
                <input
                  type="radio"
                  name="categoryId"
                  id={INPUT_IDS.categoryId + cat.id}
                  value={cat.id}
                  defaultChecked={cat.id === categoryId}
                />
                {cat.name}
              </label>
            </p>
          ))}
        </fieldset>
        <p>
          <label htmlFor={INPUT_IDS.summary}>
            Summary
            <input
              type="text"
              name="summary"
              id={INPUT_IDS.summary}
              defaultValue={summary}
              disabled={isFormSubmitting}
            />
          </label>
        </p>
        <div>
          <label htmlFor={INPUT_IDS.description}>
            Description
            <textarea
              name="description"
              id={INPUT_IDS.description}
              defaultValue={description}
              cols={30}
              rows={10}
              disabled={isFormSubmitting}
            />
          </label>
        </div>
        <p>
          <label htmlFor={INPUT_IDS.imageUrl}>
            Image URL
            <input
              type="text"
              name="imageUrl"
              id={INPUT_IDS.imageUrl}
              defaultValue={imageUrl}
              disabled={isFormSubmitting}
            />
          </label>
        </p>
        <button
          type="submit"
          disabled={categories.length === 0 || isFormSubmitting}
        >
          Submit
        </button>
        <button type="button" onClick={handleReset} disabled={isFormSubmitting}>
          Reset
        </button>
      </form>
    </>
  );
}

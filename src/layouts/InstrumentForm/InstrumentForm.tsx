import { Link, useNavigate } from "@reach/router";
import type { RouteComponentProps } from "@reach/router";
import React, { useRef, useState } from "react";
import type { FormEvent } from "react";

import { isAxiosError, updateInstrument } from "#api";
import type { AuthenticatedAPIHandlers } from "#api";
import { useAuth } from "#hooks/useAuth";
import { useCategories } from "#hooks/useCategories";
import type { IInstrument } from "#src/types";
import { getInstrumentPath } from "#utils/paths";

interface InstrumentFormControls extends HTMLFormControlsCollection {
  categoryId: RadioNodeList;
  name: HTMLInputElement;
  summary: HTMLInputElement;
  description: HTMLTextAreaElement;
  imageUrl: HTMLInputElement;
}

export interface InstrumentFormElement extends HTMLFormElement {
  elements: InstrumentFormControls;
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

export type InstrumentFormProps = Partial<Omit<IInstrument, "userId">> & {
  setInstrument?: (value: IInstrument) => void;
};

export function InstrumentForm({
  id = undefined,
  categoryId = -1,
  name = "",
  summary = "",
  description = "",
  imageUrl = "",
  setInstrument,
}: InstrumentFormProps & RouteComponentProps): JSX.Element {
  const auth = useAuth();
  const navigate = useNavigate();
  const form = useRef<InstrumentFormElement>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { categories } = useCategories();
  const canSubmitForm = categories.length > 0 && !isFormSubmitting;

  if (auth.state !== "AUTHENTICATED") {
    return (
      <p>
        Whoops, you found a bug! InstrumentForm should never be mounted if
        you’re not authenticated.
      </p>
    );
  }

  // TODO `const isNewInstrument = id === undefined` when TS can save typechecks
  // https://github.com/microsoft/TypeScript/issues/12184

  const handleSubmit = (event: FormEvent<InstrumentFormElement>) => {
    event.preventDefault();

    if (!canSubmitForm || !event.currentTarget.checkValidity()) {
      return;
    }

    setIsFormSubmitting(true);
    setErrorMessage("");

    const formInputs = event.currentTarget.elements;

    // I'd rather use `formInputs.categoryId` but jsdom doesn't implement
    // `RadioNodeList`, so tests would fail even though it works in the browser:
    // https://github.com/jsdom/jsdom/issues/2600
    const categoryIdInput = event.currentTarget.querySelector<HTMLInputElement>(
      "input[name=categoryId]:checked"
    );
    if (categoryIdInput === null) {
      return;
    }
    const formValues: InstrumentFormValues = {
      categoryId: Number(categoryIdInput.value),
      name: formInputs.name.value,
      summary: formInputs.summary.value,
      description: formInputs.description.value,
      imageUrl: formInputs.imageUrl.value,
    };

    const handlers: AuthenticatedAPIHandlers<IInstrument> = {
      onSuccess(newInstrument) {
        setIsFormSubmitting(false);
        setInstrument?.(newInstrument);
        navigate(getInstrumentPath(newInstrument));
      },
      onError(uiErrorMessage, err) {
        setIsFormSubmitting(false);
        if (isAxiosError(err) && err.response?.data?.error) {
          setErrorMessage(err.response.data.error);
        } else {
          setErrorMessage(uiErrorMessage);
        }
      },
    };

    if (id === undefined) {
      console.dir({ newInstrument: formValues });
    } else {
      updateInstrument(id, formValues, auth.getAccessTokenSilently, handlers);
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
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <form
        ref={form}
        onSubmit={handleSubmit}
        aria-labelledby={FORM_IDS.heading}
      >
        <p>
          <label htmlFor={FORM_IDS.name}>
            Instrument name
            <input
              defaultValue={name}
              disabled={isFormSubmitting}
              id={FORM_IDS.name}
              name="name"
              type="text"
            />
          </label>
        </p>
        <fieldset disabled={isFormSubmitting}>
          <legend>Category</legend>
          {categories.map((cat) => (
            <p key={cat.id}>
              <label htmlFor={FORM_IDS.categoryId + cat.id}>
                <input
                  defaultChecked={cat.id === categoryId}
                  id={FORM_IDS.categoryId + cat.id}
                  name="categoryId"
                  required
                  type="radio"
                  value={cat.id}
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
              defaultValue={summary}
              disabled={isFormSubmitting}
              id={FORM_IDS.summary}
              name="summary"
              type="text"
            />
          </label>
        </p>
        <div>
          <label htmlFor={FORM_IDS.description}>
            Description
            <textarea
              cols={30}
              defaultValue={description}
              disabled={isFormSubmitting}
              id={FORM_IDS.description}
              name="description"
              rows={10}
            />
          </label>
        </div>
        <p>
          <label htmlFor={FORM_IDS.imageUrl}>
            Image URL
            <input
              defaultValue={imageUrl}
              disabled={isFormSubmitting}
              id={FORM_IDS.imageUrl}
              name="imageUrl"
              type="text"
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

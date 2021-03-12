import { Link, useNavigate } from "@reach/router";
import type { RouteComponentProps } from "@reach/router";
import React, { useRef, useState } from "react";
import type { FormEvent } from "react";
import styled from "styled-components";

import { createInstrument, updateInstrument, isAxiosError } from "#api";
import type { AuthenticatedAPIHandlers } from "#api";
import { ModalConfirm } from "#components/ModalConfirm";
import { useAuth } from "#hooks/useAuth";
import { useCategories } from "#hooks/useCategories";
import type { IInstrument } from "#src/types";
import { getInstrumentPath } from "#utils/paths";

const StyledForm = styled.form`
  fieldset,
  input[type="text"],
  input[type="url"],
  textarea {
    display: block;
    border: 1px solid #999;
    border-radius: 4px;
    padding: 0.5em;
    width: 100%;
    font-size: 0.9em;
  }

  input:focus,
  textarea:focus {
    background: #f3f3f3;
  }

  label,
  legend {
    font-weight: bold;
  }

  fieldset label {
    font-weight: normal;
  }

  fieldset {
    display: flex;
    flex-flow: column nowrap;

    div {
      line-height: 3em;
    }

    input[type="radio"] {
      margin-right: 0.5em;
    }

    @media (min-width: ${({ theme }) => theme.mobileBreakpoint}) {
      flex-flow: row wrap;

      div {
        line-height: 1.5em;
        margin-left: 1.5em;

        &:first-of-type {
          margin-left: 0;
        }
      }
    }
  }

  textarea {
    resize: vertical;
    height: 12em;
    overflow: auto;
    font-family: inherit;
  }

  button {
    padding: 0.5em 1em;
    font-size: 1em;
  }

  .button-container {
    display: flex;
    justify-content: space-between;

    @media (min-width: ${({ theme }) => theme.mobileBreakpoint}) {
      justify-content: flex-start;

      button {
        margin-left: 1.5em;

        &:first-child {
          margin-left: 0;
        }
      }
    }
  }
`;

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

const noop = (): void => undefined;

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
  const [errorMessage, setErrorMessageValueOnly] = useState("");
  const [modalState, setModalState] = useState({
    showModal: false,
    question: "Are you sure you want to reset the form?",
    handleYes: noop,
    handleNo: () =>
      setModalState({ ...modalState, showModal: false, handleYes: noop }),
  });
  const hideModal = modalState.handleNo;
  const { categories } = useCategories();
  const canSubmitForm = categories.length > 0 && !isFormSubmitting;

  const setErrorMessage = (msg: string) => {
    setErrorMessageValueOnly(msg);
    if (msg !== "") {
      window.scroll(0, 0);
    }
  };

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
    const thisForm = event.currentTarget;
    const formInputs = thisForm.elements;

    if (!canSubmitForm || !thisForm.reportValidity()) {
      return;
    }

    // I'd rather use `formInputs.categoryId` but jsdom doesn't implement
    // `RadioNodeList`, so tests would fail even though it works in the browser:
    // https://github.com/jsdom/jsdom/issues/2600
    const categoryIdInput = thisForm.querySelector<HTMLInputElement>(
      "input[name=categoryId]:checked"
    );

    // Check to narrow type (but should already be validated by reportValidity)
    if (categoryIdInput === null) {
      setErrorMessage("Please choose a category before submitting the form");
      return;
    }

    const formValues: InstrumentFormValues = {
      categoryId: Number(categoryIdInput.value),
      name: formInputs.name.value.trim(),
      summary: formInputs.summary.value.trim(),
      description: formInputs.description.value.trim(),
      imageUrl: formInputs.imageUrl.value.trim(),
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

    setIsFormSubmitting(true);
    setErrorMessage("");

    if (id === undefined) {
      createInstrument(formValues, auth.getAccessTokenSilently, handlers);
    } else {
      updateInstrument(id, formValues, auth.getAccessTokenSilently, handlers);
    }
  };

  const handleReset = () => {
    setModalState({
      ...modalState,
      showModal: true,
      handleYes: () => {
        form.current?.reset();
        hideModal();
      },
    });
  };

  return (
    <>
      {modalState.showModal && (
        <ModalConfirm onYes={modalState.handleYes} onNo={modalState.handleNo}>
          {modalState.question}
        </ModalConfirm>
      )}
      {id === undefined ? (
        <h2 id={FORM_IDS.heading}>New instrument</h2>
      ) : (
        <h2 id={FORM_IDS.heading}>
          Edit instrument:{" "}
          <Link to={getInstrumentPath({ name, id })}>{name}</Link>
        </h2>
      )}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <StyledForm
        ref={form}
        onSubmit={handleSubmit}
        aria-labelledby={FORM_IDS.heading}
        // All text values should be unique per instrument. Autocompleting old
        // text when editing is unhelpful since the *point* is entering new text
        autoComplete="off"
      >
        <p>
          <label htmlFor={FORM_IDS.name}>
            Instrument name
            <input
              autoCorrect="off" // Many instruments aren't in the dictionary
              defaultValue={name}
              disabled={isFormSubmitting}
              id={FORM_IDS.name}
              maxLength={30}
              name="name"
              pattern=".*\S.*" // At least 1 non-whitespace character
              required
              spellCheck="false" // Many instruments aren't in the dictionary
              type="text"
            />
          </label>
        </p>
        <fieldset disabled={isFormSubmitting}>
          <legend>Category</legend>
          {categories.map((cat) => (
            <div key={cat.id}>
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
            </div>
          ))}
        </fieldset>
        <p>
          <label htmlFor={FORM_IDS.summary}>
            Summary
            <input
              defaultValue={summary}
              disabled={isFormSubmitting}
              id={FORM_IDS.summary}
              maxLength={150}
              name="summary"
              required
              type="text"
            />
          </label>
        </p>
        <div>
          <label htmlFor={FORM_IDS.description}>
            Description
            <textarea
              defaultValue={description}
              disabled={isFormSubmitting}
              id={FORM_IDS.description}
              name="description"
            />
          </label>
        </div>
        <p>
          <label htmlFor={FORM_IDS.imageUrl}>
            Image URL
            <input
              autoCorrect="off"
              defaultValue={imageUrl}
              disabled={isFormSubmitting}
              id={FORM_IDS.imageUrl}
              maxLength={500}
              name="imageUrl"
              placeholder="https://www.example.com/img.jpg"
              spellCheck="false"
              type="url"
            />
          </label>
        </p>
        <div className="button-container">
          <button type="submit" disabled={!canSubmitForm}>
            Submit
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isFormSubmitting}
          >
            Reset
          </button>
        </div>
      </StyledForm>
    </>
  );
}

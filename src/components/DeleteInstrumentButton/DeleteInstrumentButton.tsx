import { useNavigate } from "@reach/router";
import React, { useState } from "react";

import { deleteInstrument } from "#api";
import { BaseButton } from "#components/BaseButton";
import { ModalConfirm } from "#components/ModalConfirm";
import { useAuth } from "#hooks/useAuth";
import type { IInstrument } from "#src/types";

const noop = (): void => undefined;
const baseModalState = {
  showModal: false,
  disableButtons: false,
  question: "",
  handleYes: noop,
  // handleNo is defined in the useState initial value
};

export type DeleteInstrumentButtonProps = Pick<IInstrument, "id" | "name">;

export function DeleteInstrumentButton({
  id,
  name,
}: DeleteInstrumentButtonProps): JSX.Element {
  const auth = useAuth();
  const navigate = useNavigate();
  const [modalState, setModalState] = useState({
    ...baseModalState,
    handleNo: () =>
      setModalState({ ...baseModalState, handleNo: modalState.handleNo }),
  });
  const hideModal = modalState.handleNo;

  if (auth.state !== "AUTHENTICATED") {
    throw new Error(
      "<DeleteInstrumentButton /> should only be rendered when authenticated"
    );
  }

  const handleDeleteInstrumentConfirmed = () => {
    setModalState((state) => ({ ...state, disableButtons: true }));

    deleteInstrument(id, auth.getAccessTokenSilently, {
      onSuccess() {
        hideModal();
        navigate("/");
      },
      onError(uiErrorMessage) {
        setModalState({
          ...modalState,
          showModal: true,
          disableButtons: false,
          question: `${uiErrorMessage} — Would you like to try deleting ${name} again?`,
          handleYes: handleDeleteInstrumentConfirmed,
        });
      },
    });
  };

  const handleClick = () => {
    setModalState({
      ...modalState,
      showModal: true,
      question: `Are you sure you want to PERMANENTLY DELETE “${name}”?`,
      handleYes: handleDeleteInstrumentConfirmed,
    });
  };

  return (
    <>
      {modalState.showModal && (
        <ModalConfirm
          yesText="Yes, delete it"
          noText="No, keep it"
          onYes={modalState.handleYes}
          onNo={modalState.handleNo}
          disableButtons={modalState.disableButtons}
        >
          {modalState.question}
        </ModalConfirm>
      )}
      <BaseButton type="button" bgColor="#f66" onClick={handleClick}>
        Delete instrument
      </BaseButton>
    </>
  );
}

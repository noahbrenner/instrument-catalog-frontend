import React, { useState } from "react";

import { BaseButton } from "#components/BaseButton";
import { ModalConfirm } from "#components/ModalConfirm";
import type { IInstrument } from "#src/types";

const noop = (): void => undefined;
const baseModalState = {
  showModal: false,
  question: "",
  handleYes: noop,
  // handleNo is defined in the useState initial value
};

export type DeleteInstrumentButtonProps = Pick<IInstrument, "id" | "name">;

export function DeleteInstrumentButton({
  id,
  name,
}: DeleteInstrumentButtonProps): JSX.Element {
  const [modalState, setModalState] = useState({
    ...baseModalState,
    handleNo: () =>
      setModalState({ ...baseModalState, handleNo: modalState.handleNo }),
  });
  const hideModal = modalState.handleNo;

  const handleClick = () => {
    setModalState({
      ...modalState,
      showModal: true,
      question: `Are you sure you want to PERMANENTLY DELETE “${name}”?`,
      handleYes: () => {
        console.log(`TODO: Delete instrument ${id} and navigate to "/"`);
        window.alert("'Delete Instrument' has not been implemented yet");
        hideModal();
      },
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

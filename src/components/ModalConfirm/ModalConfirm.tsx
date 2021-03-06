import React from "react";
import styled from "styled-components";

import { BaseButton } from "#components/BaseButton";
import { Modal } from "#components/Modal";

const ConfirmContainer = styled.div`
  p {
    margin: 0 0 1rem;
    text-align: center;
    font-weight: bold;
  }

  div {
    display: flex;
    justify-content: space-between;

    button:first-child {
      margin-right: 1rem;
    }
  }
`;

export interface ModalConfirmProps {
  /** `children` should be the question being asked of the user */
  children: string | string[];
  onYes: () => unknown;
  onNo: () => unknown;
  yesText?: string;
  noText?: string;
}

export function ModalConfirm({
  children,
  onYes,
  onNo,
  yesText = "Yes",
  noText = "No",
}: ModalConfirmProps): JSX.Element {
  return (
    <Modal>
      <ConfirmContainer>
        <p>{children}</p>
        <div>
          <BaseButton type="button" onClick={onYes}>
            {yesText}
          </BaseButton>
          <BaseButton type="button" onClick={onNo}>
            {noText}
          </BaseButton>
        </div>
      </ConfirmContainer>
    </Modal>
  );
}

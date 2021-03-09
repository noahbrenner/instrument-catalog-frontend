import React from "react";
import styled, { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  body {
    overflow: hidden;
  }
`;

// <dialog> might be better than <div>, once it has wider support
const StyledModal = styled.div`
  // Cover the whole page
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);

  // Center the child div
  display: flex;
  justify-content: center;
  align-items: center;

  > div {
    border 2px solid #aaa;
    padding: 1em;
    max-width: 18em;
    background: white;
  }
`;

export interface ModalProps {
  children: React.ReactNode | React.ReactNode[];
}

/** This modal is static, so parent components must render it conditionally */
export function Modal({ children }: ModalProps): JSX.Element {
  return (
    <StyledModal>
      <GlobalStyle />
      <div>{children}</div>
    </StyledModal>
  );
}

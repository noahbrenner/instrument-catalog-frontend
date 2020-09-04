import React from "react";

export interface BurgerButtonProps {
  onClick: () => void;
}

export function BurgerButton({ onClick }: BurgerButtonProps): JSX.Element {
  return (
    <button type="button" onClick={onClick}>
      <img src="" alt="menu" />
    </button>
  );
}

import IconButton from "@material-ui/core/IconButton";
import Close from "@material-ui/icons/Close";
import Menu from "@material-ui/icons/Menu";
import React from "react";

export interface BurgerButtonProps {
  className?: string;
  navIsVisible: boolean;
  onClick: () => void;
}

export function BurgerButton({
  className,
  navIsVisible,
  onClick,
}: BurgerButtonProps): JSX.Element {
  return (
    <IconButton
      type="button"
      aria-label={navIsVisible ? "Close menu" : "Open menu"}
      onClick={onClick}
      className={className}
    >
      {navIsVisible ? <Close fontSize="large" /> : <Menu fontSize="large" />}
    </IconButton>
  );
}

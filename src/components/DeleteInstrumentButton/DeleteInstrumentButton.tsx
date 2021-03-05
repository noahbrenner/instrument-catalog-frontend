import React from "react";

import { BaseButton } from "#components/BaseButton";
import type { IInstrument } from "#src/types";

export type DeleteInstrumentButtonProps = Pick<IInstrument, "id" | "name">;

export function DeleteInstrumentButton({
  id,
  name,
}: DeleteInstrumentButtonProps): JSX.Element {
  const handleClick = () => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      console.log(`TODO: Delete instrument ${id} and navigate to "/"`);
      window.alert("'Delete Instrument' Hasn't been implemented yet");
    }
  };

  return (
    <BaseButton bgColor="#f66" onClick={handleClick}>
      Delete instrument
    </BaseButton>
  );
}

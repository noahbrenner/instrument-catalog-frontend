import type { RouteComponentProps } from "@reach/router";
import React from "react";

import type { IInstrument } from "#src/types";

export type InstrumentFormProps = Partial<IInstrument>;

export function InstrumentForm({
  id,
  ...instrument
}: Partial<InstrumentFormProps> & RouteComponentProps): JSX.Element {
  return (
    <>
      {id === undefined ? (
        <h2>New instrument</h2>
      ) : (
        <h2>Edit instrument: {instrument.name}</h2>
      )}
    </>
  );
}

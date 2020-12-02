import React from "react";

import type { IInstrument } from "#src/types";

export type InstrumentProps = Pick<
  IInstrument,
  "name" | "summary" | "description"
>;

export function Instrument({
  name,
  summary,
  description,
}: InstrumentProps): JSX.Element {
  return (
    <>
      <h2>{name}</h2>
      <p>{summary}</p>
      <hr />
      <p>{description}</p>
    </>
  );
}

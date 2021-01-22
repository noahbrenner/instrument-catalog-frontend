import { Link } from "@reach/router";
import React from "react";

import type { IInstrument } from "#src/types";
import { getInstrumentPath } from "#utils/paths";

export type InstrumentListItemProps = Pick<
  IInstrument,
  "id" | "name" | "summary"
>;

export function InstrumentListItem({
  id,
  name,
  summary,
}: InstrumentListItemProps): JSX.Element {
  return (
    <section>
      <h3>
        <Link to={getInstrumentPath({ id, name })}>{name}</Link>
      </h3>
      <p>{summary}</p>
    </section>
  );
}

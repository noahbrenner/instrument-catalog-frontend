import { Link } from "@reach/router";
import React from "react";

import type { IInstrument } from "#src/types";

export type InstrumentListItemProps = Pick<
  IInstrument,
  "id" | "name" | "summary"
>;

export function InstrumentListItem({
  id,
  name,
  summary,
}: InstrumentListItemProps): JSX.Element {
  const url = `/instruments/${id}/${encodeURIComponent(name)}/`;
  return (
    <section>
      <h3>
        <Link to={url}>{name}</Link>
      </h3>
      <p>{summary}</p>
    </section>
  );
}

import React, { Fragment } from "react";

import { InstrumentListItem } from "./InstrumentListItem";
import type { InstrumentListItemProps } from "./InstrumentListItem";

export interface InstrumentListProps {
  instruments: InstrumentListItemProps[];
}

export function InstrumentList({
  instruments,
}: InstrumentListProps): JSX.Element {
  return (
    <>
      {instruments.map(({ id, name, summary }, index) => (
        <Fragment key={id}>
          {index > 0 ? <hr /> : undefined}
          <InstrumentListItem id={id} name={name} summary={summary} />
        </Fragment>
      ))}
    </>
  );
}

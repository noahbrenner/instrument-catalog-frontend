/**
 * This component intentionally lacks unit tests (all behavior is delegated)
 * It's covered by integration tests instead
 */

import React, { useEffect, useState } from "react";

import { getInstrumentsByCategoryId } from "#api";
import { CategoryDetail } from "#components/CategoryDetail";
import { InstrumentList } from "#components/InstrumentList";
import type { InstrumentListProps } from "#components/InstrumentList";
import type { ICategory } from "#src/types";

export type CategoryProps = Pick<
  ICategory,
  "id" | "name" | "summary" | "description"
>;

export function Category({
  id,
  name,
  summary,
  description,
}: CategoryProps): JSX.Element {
  const [loadingMessage, setLoadingMessage] = useState("...Loading");
  const [instruments, setInstruments] = useState<
    InstrumentListProps["instruments"]
  >();

  useEffect(() => {
    // Reset state
    setLoadingMessage("...Loading");
    setInstruments(undefined);

    const { cancel } = getInstrumentsByCategoryId(id, {
      onSuccess: (data) => setInstruments(data.instruments),
      onError: (uiErrorMessage) => setLoadingMessage(uiErrorMessage),
    });

    return cancel;
  }, [id]);

  return (
    <>
      <CategoryDetail name={name} summary={summary} description={description} />
      {instruments ? (
        <InstrumentList instruments={instruments} />
      ) : (
        <p>{loadingMessage}</p>
      )}
    </>
  );
}

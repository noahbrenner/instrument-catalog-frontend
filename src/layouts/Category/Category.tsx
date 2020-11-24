/*
 * This component intentionally lacks unit tests
 * It has integration tests instead
 */

import React, { useEffect, useState } from "react";

import { api } from "#api";
import type { APIError } from "#api";
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
    api.getInstrumentsByCategoryId(id).then(
      ({ data }) => {
        setInstruments(data.instruments);
      },
      (err: APIError) => {
        setLoadingMessage(err.uiErrorMessage);
      }
    );
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

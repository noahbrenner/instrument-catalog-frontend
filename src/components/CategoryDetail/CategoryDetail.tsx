import React from "react";

import type { ICategory } from "#src/types";

export type CategoryDetailProps = Pick<
  ICategory,
  "name" | "summary" | "description"
>;

export function CategoryDetail({
  name,
  summary,
  description,
}: CategoryDetailProps): JSX.Element {
  return (
    <>
      <h2>{name}</h2>
      <p>{summary}</p>
      <p>{description}</p>
    </>
  );
}

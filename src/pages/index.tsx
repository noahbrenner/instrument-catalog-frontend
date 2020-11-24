import type { RouteComponentProps } from "@reach/router";
import React from "react";

import { ApiDiv } from "#components/ApiDiv";
import { CategoryListItem } from "#components/CategoryListItem";

export default function HomePage(_: RouteComponentProps): JSX.Element {
  return (
    <div>
      <ApiDiv />
      <h2>Browse by category</h2>
      <CategoryListItem
        name="Winds"
        url="/categories/winds/"
        itemCount={1}
        summary="Move air, make noise"
      />
      <CategoryListItem
        name="Percussion"
        url="/categories/percussion/"
        itemCount={300}
        summary="Hit stuff"
      />
    </div>
  );
}

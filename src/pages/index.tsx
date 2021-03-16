import type { RouteComponentProps } from "@reach/router";
import React from "react";

import { CategoryListItem } from "#components/CategoryListItem";

export default function HomePage(_: RouteComponentProps): JSX.Element {
  return (
    <div>
      <h2>Browse by category</h2>
      <CategoryListItem
        name="Winds"
        url="/categories/winds/"
        summary="Move air, make noise"
      />
      <CategoryListItem
        name="Percussion"
        url="/categories/percussion/"
        summary="Hit stuff"
      />
    </div>
  );
}

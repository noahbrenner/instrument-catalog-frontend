import type { RouteComponentProps } from "@reach/router";
import React from "react";

import { ApiDiv } from "#components/ApiDiv";
import { Category } from "#components/Category";

export default function Home(_: RouteComponentProps): JSX.Element {
  return (
    <div>
      <ApiDiv />
      <h2>Browse by category</h2>
      <Category
        name="Winds"
        url="/category/winds/"
        itemCount={1}
        summary="Move air, make noise"
      />
      <Category
        name="Percussion"
        url="/category/percussion/"
        itemCount={300}
        summary="Hit stuff"
      />
    </div>
  );
}

import type { RouteComponentProps } from "@reach/router";
import React from "react";

import { ApiDiv } from "#components/ApiDiv";
import { Category } from "#components/Category";

export default function Home(_: RouteComponentProps): JSX.Element {
  return (
    <div>
      <h2>
        Welcome to React-Static <br /> + TypeScript
      </h2>
      <p>
        Learn{" "}
        <a href="https://github.com/sw-yx/react-typescript-cheatsheet">
          React + TypeScript
        </a>
      </p>
      <p>
        <a href="https://twitter.com/swyx">Report issues with this template</a>
      </p>
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

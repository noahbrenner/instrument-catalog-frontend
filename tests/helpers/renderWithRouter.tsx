import React from "react";
import { render } from "@testing-library/react";
import type { RenderResult } from "@testing-library/react";
import {
  LocationProvider,
  createHistory,
  createMemorySource,
} from "@reach/router";
import type { History } from "@reach/router";

// Reference: https://testing-library.com/docs/example-reach-router

/** Render (for testing) a component that contains a Router */
export function renderWithRouter(
  component: JSX.Element,
  route = "/"
): RenderResult & { history: History } {
  const history = createHistory(createMemorySource(route));
  return {
    ...render(
      <LocationProvider history={history}>{component}</LocationProvider>
    ),
    history,
  };
}

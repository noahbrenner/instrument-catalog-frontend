import { render } from "@testing-library/react";
import React from "react";
import { ThemeProvider } from "styled-components";

import { defaultTheme } from "#src/theme";

/** Render (for testing) a component nested inside a <ThemeProvider> */
export function renderWithDefaultTheme(
  component: JSX.Element
): ReturnType<typeof render> {
  return render(
    <ThemeProvider theme={defaultTheme}>{component}</ThemeProvider>
  );
}

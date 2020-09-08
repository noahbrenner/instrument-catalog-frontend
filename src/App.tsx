import { Router } from "@reach/router";
// eslint-disable-next-line import/no-extraneous-dependencies
import { setupWorker } from "msw"; // Dev usage only
import React, { useState } from "react";
import { Root, addPrefetchExcludes } from "react-static";
import { ThemeProvider, createGlobalStyle } from "styled-components";

import { BurgerButton } from "#components/BurgerButton";
import { Nav } from "#components/Nav";
import Dynamic from "#containers/Dynamic";
import { handlers } from "#server_routes.mock"; // Dev usage only
import Home from "./pages";
import About from "./pages/about";
import { defaultTheme } from "./theme";
import "./app.css";

// Mock the API server using a ServiceWorker
if (
  process.env.FRONTEND_MOCK_API_SERVER === "true" &&
  process.env.NODE_ENV !== "production" &&
  typeof document !== undefined
) {
  setupWorker(...handlers).start();
}

const GlobalStyle = createGlobalStyle`
  *, ::before, ::after {
    box-sizing: border-box;
  }

  body {
    width: 100%;
  }

 header {
  display: flex;
  height: ${({ theme }) => theme.headerHeight};
  background: ${({ theme }) => theme.headerBg};

  & h1 {
    flex-grow: 1;
    margin: 0;
    text-align: center;
  }

  @media (min-width: ${({ theme }) => theme.mobileBreakpoint}) {
    & .burger {
      display: none;
    }
  }
 }
`;

// Any routes that start with 'dynamic' will be treated as non-static routes
addPrefetchExcludes(["dynamic"]);

export function App(): JSX.Element {
  const [navIsVisible, setNavIsVisible] = useState(false);
  const toggleNav = () => setNavIsVisible((isHidden) => !isHidden);
  const hideNav = () => setNavIsVisible(true);

  return (
    <Root>
      <ThemeProvider theme={defaultTheme}>
        <GlobalStyle />
        <header>
          <h1>Instrument Catalog</h1>
          <BurgerButton
            className="burger"
            onClick={toggleNav}
            navIsVisible={navIsVisible}
          />
        </header>
        <Nav
          links={[
            ["Home", "/"],
            ["About", "/about"],
            ["Dynamic", "/dynamic"],
          ]}
          onLinkClick={hideNav}
          visible={navIsVisible}
        />
        <main>
          <Router>
            <Home path="/" />
            <About path="about" />
            <Dynamic path="dynamic" />
          </Router>
        </main>
      </ThemeProvider>
    </Root>
  );
}

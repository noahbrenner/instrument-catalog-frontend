import { Router } from "@reach/router";
import React, { useState } from "react";
import { Root, addPrefetchExcludes } from "react-static";
import styled, { ThemeProvider } from "styled-components";

import { BurgerButton } from "#components/BurgerButton";
import { Nav } from "#components/Nav";
import HomePage from "./pages";
import NotFound from "./pages/404";
import CategoriesPage from "./pages/categories";
import CategoryPage from "./pages/category";
import InstrumentPage from "./pages/instrument";
import NewInstrumentPage from "./pages/instruments/new";
import { defaultTheme } from "./theme";
import "./app.css";

// Don't try to prefetch dynamic routes
addPrefetchExcludes([/categories\/.+/, /instruments\/.+/]);

// Mock the API server using a ServiceWorker
if (
  process.env.FRONTEND_MOCK_API_SERVER === "true" &&
  process.env.NODE_ENV !== "production" &&
  typeof document !== undefined
) {
  // Use conditional require() instead of import to prevent bundling these files
  // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-extraneous-dependencies
  const { setupWorker } = require("msw");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { handlers } = require("#server_routes.mock");
  setupWorker(...handlers).start();
}

const StyledHeader = styled.header`
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
`;

export function App(): JSX.Element {
  const [navIsVisible, setNavIsVisible] = useState(false);
  const toggleNav = () => setNavIsVisible((isVisible) => !isVisible);
  const hideNav = () => setNavIsVisible(false);

  return (
    <Root>
      <ThemeProvider theme={defaultTheme}>
        <StyledHeader>
          <h1>Instrument Catalog</h1>
          <BurgerButton
            className="burger"
            onClick={toggleNav}
            navIsVisible={navIsVisible}
          />
        </StyledHeader>
        <Nav onLinkClick={hideNav} visible={navIsVisible} />
        <main>
          <Router>
            <HomePage path="/" />
            <CategoriesPage path="categories/" />
            <CategoryPage path="categories/:categorySlug/" />
            <InstrumentPage path="instruments/:instrumentId/**" />
            <NewInstrumentPage path="instruments/new/" />
            <NotFound default />
          </Router>
        </main>
      </ThemeProvider>
    </Root>
  );
}

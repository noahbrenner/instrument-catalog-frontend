import { Auth0Provider } from "@auth0/auth0-react";
import type { AppState } from "@auth0/auth0-react";
import { Router, navigate } from "@reach/router";
import React, { useState } from "react";
import { Root, addPrefetchExcludes } from "react-static";
import { ThemeProvider, createGlobalStyle } from "styled-components";

import { BurgerButton } from "#components/BurgerButton";
import { Nav } from "#components/Nav";
import HomePage from "./pages";
import NotFound from "./pages/404";
import CategoriesPage from "./pages/categories";
import CategoryPage from "./pages/category";
import InstrumentPage from "./pages/instrument";
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

const isBrowser = typeof window !== "undefined";

function handleAuthRedirect(appState?: AppState) {
  if (isBrowser) {
    navigate(appState?.returnTo ?? window.location.pathname, { replace: true });
  }
}

export function App(): JSX.Element {
  const [navIsVisible, setNavIsVisible] = useState(false);
  const toggleNav = () => setNavIsVisible((isVisible) => !isVisible);
  const hideNav = () => setNavIsVisible(false);

  return (
    <Root>
      <Auth0Provider
        domain={process.env.AUTH0_DOMAIN || ""}
        clientId={process.env.AUTH0_CLIENT_ID || ""}
        redirectUri={isBrowser ? window.location.origin : ""}
        onRedirectCallback={handleAuthRedirect}
        audience={process.env.AUTH0_BACKEND_API_IDENTIFIER || ""}
        useRefreshTokens
      >
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
              ["Categories", "/categories/"],
            ]}
            onLinkClick={hideNav}
            visible={navIsVisible}
          />
          <main>
            <Router>
              <HomePage path="/" />
              <CategoriesPage path="categories/" />
              <CategoryPage path="categories/:categorySlug/" />
              <InstrumentPage path="instruments/:instrumentId/**" />
              <NotFound default />
            </Router>
          </main>
        </ThemeProvider>
      </Auth0Provider>
    </Root>
  );
}

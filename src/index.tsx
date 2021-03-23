import { Auth0Provider } from "@auth0/auth0-react";
import type { AppState } from "@auth0/auth0-react";
import { navigate } from "@reach/router";
import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";

import { App } from "./App";

// Export the top level component as JSX (for static rendering)
export default App;

// Render the app
if (typeof document !== "undefined") {
  const target = document.getElementById("root") as HTMLElement;

  const renderMethod = target.hasChildNodes()
    ? ReactDOM.hydrate
    : ReactDOM.render;

  const handleAuthRedirect = (appState?: AppState) => {
    navigate(appState?.returnTo ?? window.location.pathname, { replace: true });
  };

  const render = (AppComponent: () => JSX.Element) => {
    renderMethod(
      <AppContainer>
        <Auth0Provider
          domain={process.env.AUTH0_DOMAIN || ""}
          clientId={process.env.AUTH0_CLIENT_ID || ""}
          redirectUri={window.location.origin}
          onRedirectCallback={handleAuthRedirect}
          audience={process.env.AUTH0_BACKEND_API_IDENTIFIER || ""}
          useRefreshTokens
        >
          <AppComponent />
        </Auth0Provider>
      </AppContainer>,
      target
    );
  };

  // Render!
  render(App);

  // Hot Module Replacement
  if (module && module.hot) {
    module.hot.accept("./App", () => {
      render(App);
    });
  }
}

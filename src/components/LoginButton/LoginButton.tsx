import React from "react";

import { useAuth } from "#hooks/useAuth";

export function LoginButton(): JSX.Element {
  const auth = useAuth();

  return auth.state === "AUTHENTICATED" ? (
    <button
      type="button"
      onClick={() => auth.logout({ returnTo: window.location.origin })}
    >
      Log out
    </button>
  ) : (
    <button
      type="button"
      onClick={() => {
        auth.loginWithRedirect({
          redirectUri: window.location.origin,
          appState: { returnTo: window.location.pathname },
        });
      }}
    >
      Log in
    </button>
  );
}

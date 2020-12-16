import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

export function LoginButton(): JSX.Element {
  const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

  return isAuthenticated && !isLoading ? (
    <button
      type="button"
      onClick={() => logout({ returnTo: window.location.origin })}
    >
      Log out
    </button>
  ) : (
    <button
      type="button"
      onClick={() => {
        loginWithRedirect({
          redirectUri: window.location.origin,
          appState: { returnTo: window.location.pathname },
        });
      }}
    >
      Log in
    </button>
  );
}

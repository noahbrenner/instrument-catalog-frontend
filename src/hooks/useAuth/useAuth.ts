import { useAuth0 } from "@auth0/auth0-react";
import type { AppState } from "@auth0/auth0-react";

import type { IUser } from "#src/types";

type Login = (options?: { appState: AppState }) => Promise<void>;
type Logout = (options?: { returnTo: string }) => void;

export type Auth =
  | {
      state: "LOADING";
      login: Login;
    }
  | {
      state: "ERRORED";
      error: Error;
      login: Login;
    }
  | {
      state: "UNAUTHENTICATED";
      login: Login;
    }
  | {
      state: "AUTHENTICATED";
      user: IUser;
      logout: Logout;
    };

export function useAuth(): Auth {
  const {
    error,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: auth0Logout,
    user,
  } = useAuth0();

  /** Begin the login flow -- Usage: login({ appState: { returnTo: "/" } }) */
  const login: Login = (opt?) => {
    const appState: AppState = {
      returnTo: window.location.pathname,
      ...(opt?.appState || {}),
    };
    return loginWithRedirect({ redirectUri: window.location.origin, appState });
  };

  const logout: Logout = (opt?) => {
    // NOTE The `returnTo` value must be registered in the Auth0 dashboard
    auth0Logout({ returnTo: opt?.returnTo ?? window.location.origin });
  };

  if (isLoading) {
    return { state: "LOADING", login };
  }

  if (error) {
    return { state: "ERRORED", error, login };
  }

  return isAuthenticated
    ? { state: "AUTHENTICATED", user, logout }
    : { state: "UNAUTHENTICATED", login };
}

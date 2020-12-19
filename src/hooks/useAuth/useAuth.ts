import { useAuth0 } from "@auth0/auth0-react";
import type { Auth0ContextInterface } from "@auth0/auth0-react";

type LoginWithRedirect = Auth0ContextInterface["loginWithRedirect"];
type Logout = Auth0ContextInterface["logout"];
type User = Auth0ContextInterface["user"];

export type Auth =
  | {
      state: "LOADING";
      loginWithRedirect: LoginWithRedirect;
    }
  | {
      state: "ERRORED";
      error: Error;
      loginWithRedirect: LoginWithRedirect;
    }
  | {
      state: "UNAUTHENTICATED";
      loginWithRedirect: LoginWithRedirect;
    }
  | {
      state: "AUTHENTICATED";
      user: User;
      logout: Logout;
    };

export function useAuth(): Auth {
  const {
    error,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    user,
  } = useAuth0();

  if (isLoading) {
    return { state: "LOADING", loginWithRedirect };
  }

  if (error) {
    return { state: "ERRORED", error, loginWithRedirect };
  }

  return isAuthenticated
    ? { state: "AUTHENTICATED", user, logout }
    : { state: "UNAUTHENTICATED", loginWithRedirect };
}

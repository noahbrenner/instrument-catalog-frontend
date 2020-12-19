import React from "react";

import { useAuth } from "#hooks/useAuth";

export function LoginButton(): JSX.Element {
  const auth = useAuth();

  return auth.state === "AUTHENTICATED" ? (
    <button type="button" onClick={() => auth.logout()}>
      Log out
    </button>
  ) : (
    <button type="button" onClick={() => auth.login()}>
      Log in
    </button>
  );
}

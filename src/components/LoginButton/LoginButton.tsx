import React from "react";

import { BaseButton } from "#components/BaseButton";
import { useAuth } from "#hooks/useAuth";

export function LoginButton(): JSX.Element {
  const auth = useAuth();

  return auth.state === "AUTHENTICATED" ? (
    <BaseButton type="button" onClick={() => auth.logout()}>
      Log out
    </BaseButton>
  ) : (
    <BaseButton type="button" onClick={() => auth.login()}>
      Log in
    </BaseButton>
  );
}

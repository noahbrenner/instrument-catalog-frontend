import React from "react";

import { BaseButton } from "#components/BaseButton";
import { useAuth } from "#hooks/useAuth";

export function LoginButton(): JSX.Element {
  const auth = useAuth();

  return auth.state === "AUTHENTICATED" ? (
    <BaseButton onClick={() => auth.logout()}>Log out</BaseButton>
  ) : (
    <BaseButton onClick={() => auth.login()}>Log in</BaseButton>
  );
}

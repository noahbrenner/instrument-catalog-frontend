import type { RouteComponentProps } from "@reach/router";
import React from "react";

import { LoginButton } from "#components/LoginButton";
import { useAuth } from "#hooks/useAuth";
import { InstrumentForm } from "#layouts/InstrumentForm";

export default function NewInstrumentPage(_: RouteComponentProps): JSX.Element {
  const auth = useAuth();

  switch (auth.state) {
    case "AUTHENTICATED":
      return <InstrumentForm />;
    case "LOADING":
      return <p>...Loading</p>;
    default:
      return (
        <>
          <h2>New instrument</h2>
          <p>You’ll need to log in before you can create a new instrument:</p>
          <LoginButton />
        </>
      );
  }
}

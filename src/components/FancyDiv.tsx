import React from "react";

export function FancyDiv({ children }: { children: JSX.Element }): JSX.Element {
  return <div style={{ border: "1px solid red" }}>{children}</div>;
}

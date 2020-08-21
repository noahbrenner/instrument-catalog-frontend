import React from "react";

export default function Dynamic({ path }: { path: string }): JSX.Element {
  return (
    <div>
      This is a dynamic page at {path}! It will not be statically exported, but
      is available at runtime.
    </div>
  );
}

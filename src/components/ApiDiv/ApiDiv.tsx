import React, { useEffect, useState } from "react";

import { api } from "#api";
import type { APIError } from "#api";

export function ApiDiv(): JSX.Element {
  const [content, setContent] = useState("...Loading");

  useEffect(() => {
    api.getUsers().then(
      ({ data }) => {
        setContent(`Users: ${JSON.stringify(data)}`);
      },
      (err: APIError) => {
        setContent(err.uiErrorMessage);
      }
    );
  }, []);

  return <div>{content}</div>;
}

import React, { useEffect, useState } from "react";

import { getUsers } from "#api";

export function ApiDiv(): JSX.Element {
  const [content, setContent] = useState("...Loading");

  useEffect(() => {
    const { cancel } = getUsers({
      onSuccess: ({ users }) => setContent(`Users: ${JSON.stringify(users)}`),
      onError: (uiErrorMessage) => setContent(uiErrorMessage),
    });
    return cancel;
  }, []);

  return <div>{content}</div>;
}

import React, { useEffect, useState } from "react";
import axios from "axios";

import { ENDPOINTS } from "#api_endpoints";
import type { IUsers } from "#src/types";

export function ApiDiv(): JSX.Element {
  const [content, setContent] = useState("...Loading");

  useEffect(() => {
    axios
      .get<IUsers>(ENDPOINTS.users)
      .then(({ data }) => {
        setContent(`Users: ${JSON.stringify(data)}`);
      })
      .catch(() => {
        setContent("Failed to load data from the API");
      });
  }, []);

  return <div>{content}</div>;
}

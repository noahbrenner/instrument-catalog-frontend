import React, { useEffect, useState } from "react";
import axios from "axios";

const { API_ROOT } = process.env;

export function ApiDiv(): JSX.Element {
  const [content, setContent] = useState("...Loading");

  useEffect(() => {
    axios
      .get<Record<string, unknown>>(`${API_ROOT}/users/all`)
      .then(({ data }) => {
        setContent(`Users: ${JSON.stringify(data)}`);
      })
      .catch(() => {
        setContent("Failed to load data from the API");
      });
  }, []);

  return <div>{content}</div>;
}

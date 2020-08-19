import React, { useEffect, useState } from "react";
import axios from "axios";

const { API_ROOT } = process.env;

export default () => {
  const [content, setContent] = useState("...Loading");

  useEffect(() => {
    axios
      .get<object>(`${API_ROOT}/users/all`)
      .then(({ data }) => {
        setContent(JSON.stringify(data));
      })
      .catch(() => {
        setContent("Failed to load data from the API");
      });
  }, []);

  return <div>{content}</div>;
};

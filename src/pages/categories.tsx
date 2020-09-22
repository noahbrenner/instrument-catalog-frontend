import axios from "axios";
import type { AxiosError } from "axios";
import type { RouteComponentProps } from "@reach/router";
import React, { Fragment, useEffect, useState } from "react";

import { ENDPOINTS } from "#api_endpoints";
import { Category } from "#components/Category";
import type { ICategory, ICategories } from "#src/types";

export default function Categories(_: RouteComponentProps): JSX.Element {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loadStateMessage, setLoadStateMessage] = useState("...Loading");

  useEffect(() => {
    axios
      .get<ICategories>(ENDPOINTS.categories)
      .then(({ data }) => {
        if (data.categories.length > 0) {
          setCategories(data.categories);
          setLoadStateMessage("");
        } else {
          setLoadStateMessage("No categories have been defined yet.");
        }
      })
      .catch((err: AxiosError) => {
        if (err.response) {
          const { status } = err.response;
          setLoadStateMessage(
            `Error from server: ${status}. Please send a bug report!`
          );
        } else if (err.request) {
          setLoadStateMessage(
            "Couldn't reach the server. Please try reloading in a minute."
          );
        } else {
          setLoadStateMessage(`Unknown error: ${err.message}`);
        }
      });
  }, []);

  return (
    <>
      <h2>Categories</h2>
      {categories.length === 0 ? (
        <p>{loadStateMessage}</p>
      ) : (
        categories.map(({ name, itemCount, summary, description }, index) => (
          <Fragment key={name}>
            {index > 0 ? <hr /> : undefined}
            <Category
              name={name}
              itemCount={itemCount}
              summary={summary}
              description={description}
              url={`/category/${name.toLowerCase()}/`}
            />
          </Fragment>
        ))
      )}
    </>
  );
}

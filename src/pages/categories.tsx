import type { RouteComponentProps } from "@reach/router";
import React, { Fragment, useEffect, useState } from "react";

import { api } from "#api";
import type { APIError } from "#api";
import { Category } from "#components/Category";
import type { ICategory } from "#src/types";

export default function Categories(_: RouteComponentProps): JSX.Element {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loadStateMessage, setLoadStateMessage] = useState("...Loading");

  useEffect(() => {
    api.getCategories().then(
      ({ data }) => {
        if (data.categories.length > 0) {
          setCategories(data.categories);
          setLoadStateMessage("");
        } else {
          setLoadStateMessage("No categories have been defined yet.");
        }
      },
      (err: APIError) => {
        setLoadStateMessage(err.uiErrorMessage);
      }
    );
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

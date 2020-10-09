import React, { Fragment } from "react";

import { Category } from "#components/Category";
import type { ICategory } from "#src/types";

export interface CategoriesProps {
  categories: ICategory[];
  loadingMessage: string;
}

export function Categories({
  categories,
  loadingMessage,
}: CategoriesProps): JSX.Element {
  return (
    <>
      <h2>Categories</h2>
      {categories.length === 0 ? (
        <p>{loadingMessage}</p>
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

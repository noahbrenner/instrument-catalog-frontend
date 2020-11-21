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
        categories.map((category, index) => (
          <Fragment key={category.name}>
            {index > 0 ? <hr /> : undefined}
            <Category
              name={category.name}
              itemCount={category.itemCount}
              summary={category.summary}
              description={category.description}
              url={`/categories/${category.slug}/`}
            />
          </Fragment>
        ))
      )}
    </>
  );
}

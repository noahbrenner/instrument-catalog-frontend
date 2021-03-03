import React, { Fragment } from "react";

import { CategoryListItem } from "#components/CategoryListItem";
import type { ICategory } from "#src/types";

export interface CategoriesProps {
  categories: ICategory[];
  /** Should be undefined once categories have loaded (even if they're []) */
  loadingMessage?: string;
}

export function Categories({
  categories,
  loadingMessage,
}: CategoriesProps): JSX.Element {
  return (
    <>
      <h2>Categories</h2>
      {categories.length === 0 ? (
        <p>{loadingMessage ?? "No categories have been defined yet."}</p>
      ) : (
        categories.map((category, index) => (
          <Fragment key={category.name}>
            {index > 0 && <hr />}
            <CategoryListItem
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

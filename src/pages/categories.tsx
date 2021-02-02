import type { RouteComponentProps } from "@reach/router";
import React from "react";

import { useCategories } from "#hooks/useCategories";
import { Categories } from "#layouts/Categories";

export default function CategoriesPage(_: RouteComponentProps): JSX.Element {
  const { categories, categoriesHaveLoaded, errorMessage } = useCategories();
  let loadingMessage: string | undefined;

  if (!categoriesHaveLoaded) {
    loadingMessage = errorMessage ?? "...Loading";
  }

  return <Categories categories={categories} loadingMessage={loadingMessage} />;
}

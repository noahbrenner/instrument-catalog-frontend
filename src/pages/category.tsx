import { useParams } from "@reach/router";
import type { RouteComponentProps } from "@reach/router";
import React, { useEffect, useState } from "react";

import { getCategoryBySlug } from "#api";
import { Category } from "#layouts/Category";
import NotFound from "#src/pages/404";
import type { ICategory } from "#src/types";

interface CategoryPageProps {
  categorySlug?: string;
}

export default function CategoryPage(_: RouteComponentProps): JSX.Element {
  const { categorySlug } = useParams() as CategoryPageProps;
  const [loadingMessage, setLoadingMessage] = useState("...Loading");
  const [category, setCategory] = useState<ICategory>();
  const [categoryExists, setCategoryExists] = useState(true);

  useEffect(() => {
    // Reset state
    setLoadingMessage("...Loading");
    setCategory(undefined);
    setCategoryExists(true); // Hide 404 unless we *know* it doesn't exist

    if (!categorySlug) {
      setCategoryExists(false);
      return;
    }

    const { cancel } = getCategoryBySlug(categorySlug, {
      onSuccess(categoryData) {
        setCategory(categoryData);
      },
      onError(uiErrorMessage, err) {
        if (err.response?.status === 404) {
          setCategoryExists(false);
        } else {
          setLoadingMessage(uiErrorMessage);
        }
      },
    });

    return cancel;
  }, [categorySlug]);

  if (!categoryExists) {
    return <NotFound />;
  }

  return category ? (
    <Category
      id={category.id}
      name={category.name}
      summary={category.summary}
      description={category.description}
    />
  ) : (
    <p>{loadingMessage}</p>
  );
}

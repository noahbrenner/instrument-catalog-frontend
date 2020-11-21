import { useParams } from "@reach/router";
import type { RouteComponentProps } from "@reach/router";
import React, { useEffect, useState } from "react";

import { api } from "#api";
import type { APIError } from "#api";
import { Category } from "#layouts/Category";
import type { CategoryProps } from "#layouts/Category";
import NotFound from "#src/pages/404";

interface CategoryPageProps {
  categorySlug?: string;
}

export default function CategoryPage(_: RouteComponentProps): JSX.Element {
  const { categorySlug } = useParams() as CategoryPageProps;
  const [loadingMessage, setLoadingMessage] = useState("...Loading");
  const [category, setCategory] = useState<CategoryProps>();
  const [categoryExists, setCategoryExists] = useState(true);

  useEffect(() => {
    if (!categorySlug) {
      setCategoryExists(false);
      return;
    }

    api.getCategoryBySlug(categorySlug).then(
      ({ data }) => {
        setCategory(data);
      },
      (err: APIError) => {
        if (err.response?.status === 404) {
          setCategoryExists(false);
        } else {
          setLoadingMessage(err.uiErrorMessage);
        }
      }
    );
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

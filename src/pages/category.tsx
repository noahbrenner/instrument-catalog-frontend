import { useParams } from "@reach/router";
import type { RouteComponentProps } from "@reach/router";
import React, { useEffect, useState } from "react";

import { api } from "#api";
import type { APIError } from "#api";
import NotFound from "#src/pages/404";

interface CategoryPageProps {
  categorySlug?: string;
}

export default function CategoryPage(_: RouteComponentProps): JSX.Element {
  const { categorySlug } = useParams() as CategoryPageProps;
  const [loadingMessage, setLoadingMessage] = useState("...Loading");
  const [name, setName] = useState("");
  const [categoryExists, setCategoryExists] = useState(true);

  useEffect(() => {
    if (!categorySlug) {
      setCategoryExists(false);
      return;
    }

    api.getCategoryBySlug(categorySlug).then(
      ({ data }) => {
        setName(data.name);
      },
      (err: APIError) => {
        if (err.response?.status === 404) {
          setCategoryExists(false);
        } else {
          setLoadingMessage(err.uiErrorMessage);
        }
      }
    );
  }, []);

  if (!categoryExists) {
    return <NotFound />;
  }

  return name ? <h2>Category: {name}</h2> : <p>{loadingMessage}</p>;
}

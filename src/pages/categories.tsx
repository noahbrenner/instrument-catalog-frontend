import type { RouteComponentProps } from "@reach/router";
import React, { useEffect, useState } from "react";

import { getCategories } from "#api";
import { Categories } from "#layouts/Categories";
import type { ICategory } from "#src/types";

export default function CategoriesPage(_: RouteComponentProps): JSX.Element {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loadingMessage, setLoadingMessage] = useState("...Loading");

  useEffect(() => {
    const { cancel } = getCategories({
      onSuccess(data) {
        if (data.categories.length > 0) {
          setCategories(data.categories);
          setLoadingMessage("");
        } else {
          setLoadingMessage("No categories have been defined yet.");
        }
      },
      onError(uiErrorMessage) {
        setLoadingMessage(uiErrorMessage);
      },
    });

    return cancel;
  }, []);

  return <Categories categories={categories} loadingMessage={loadingMessage} />;
}

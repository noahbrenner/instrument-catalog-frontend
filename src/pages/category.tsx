import { useParams } from "@reach/router";
import type { RouteComponentProps } from "@reach/router";
import React, { useEffect, useState } from "react";

import NotFound from "#src/pages/404";

function capitalize(str: string) {
  return str.length === 0 ? "" : str[0].toUpperCase() + str.slice(1);
}

interface CategoryPageProps {
  categoryName?: string;
}

export default function CategoryPage(_: RouteComponentProps): JSX.Element {
  const { categoryName } = useParams() as CategoryPageProps;
  const [name, setName] = useState("");
  const [categoryExists, setCategoryExists] = useState(true);
  const categories = ["strings", "winds", "percussion"];

  useEffect(() => {
    if (categoryName && categories.includes(categoryName)) {
      setName(capitalize(categoryName));
    } else {
      setCategoryExists(false);
    }
  }, []);

  return categoryExists ? <h2>Category: {name}</h2> : <NotFound />;
}

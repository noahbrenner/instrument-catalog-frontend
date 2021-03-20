import { Link } from "@reach/router";
import type { RouteComponentProps } from "@reach/router";
import React, { Fragment } from "react";

import { CategoryListItem } from "#components/CategoryListItem";
import { LoginButton } from "#components/LoginButton";
import { useCategories } from "#hooks/useCategories";
import { useAuth } from "#src/hooks/useAuth";

export default function HomePage(_: RouteComponentProps): JSX.Element {
  const auth = useAuth();
  const { categories } = useCategories();

  return (
    <div>
      <h2>Welcome to the Instrument Catalog!</h2>
      <p>
        Here, you can share your knowledge by giving an introduction to your
        favorite musical instruments and browse the instrument intros that
        others have posted.
      </p>
      {auth.state === "AUTHENTICATED" ? (
        <p>
          Post a <Link to="/instruments/new/">New Instrument</Link> to share
          your knowledge!
        </p>
      ) : (
        <p>
          <LoginButton /> to post your own instrument knowledge!
        </p>
      )}
      <h2>Browse instruments by category</h2>
      {categories.map(({ id, name, slug, summary }, index) => (
        <Fragment key={id}>
          {index > 0 && <hr />}
          <CategoryListItem
            name={name}
            url={`/categories/${slug}/`}
            summary={summary}
          />
        </Fragment>
      ))}
    </div>
  );
}

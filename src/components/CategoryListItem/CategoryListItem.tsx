import { Link } from "@reach/router";
import React from "react";
import styled from "styled-components";

const HeadingContainer = styled.div`
  display: flex;
  line-height: 1.5rem;

  h3 {
    margin: 0;
    font-size: 1.1rem;
  }
`;

export interface CategoryListItemProps {
  name: string;
  url: string;
  summary: string;
  description?: string;
}

export function CategoryListItem({
  name,
  url,
  summary,
  description,
}: CategoryListItemProps): JSX.Element {
  return (
    <section>
      <HeadingContainer>
        <h3>
          <Link to={url}>{name}</Link>
        </h3>
      </HeadingContainer>
      <p>{summary}</p>
      {description && <p>{description}</p>}
    </section>
  );
}

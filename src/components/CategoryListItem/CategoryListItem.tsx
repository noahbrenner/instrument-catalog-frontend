import { Link } from "@reach/router";
import React from "react";
import styled from "styled-components";

const StyledSection = styled.section`
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
    <StyledSection>
      <h3>
        <Link to={url}>{name}</Link>
      </h3>
      <p>{summary}</p>
      {description && <p>{description}</p>}
    </StyledSection>
  );
}

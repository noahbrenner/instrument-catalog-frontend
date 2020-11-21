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

  div {
    margin: 0 1rem;
    padding: 0 0.6rem;
    min-width: 2rem;
    border-radius: 8px;
    background: #aaa;
    font-size: 0.9rem;
    text-align: center;
    cursor: default;
  }
`;

export interface CategoryProps {
  name: string;
  url: string;
  itemCount: number;
  summary: string;
  description?: string;
}

export function Category({
  name,
  url,
  itemCount,
  summary,
  description,
}: CategoryProps): JSX.Element {
  return (
    <section>
      <HeadingContainer>
        <h3>
          <Link to={url}>{name}</Link>
        </h3>
        <div title="Instruments in this category">{itemCount}</div>
      </HeadingContainer>
      <p>{summary}</p>
      {description ? <p>{description}</p> : undefined}
    </section>
  );
}

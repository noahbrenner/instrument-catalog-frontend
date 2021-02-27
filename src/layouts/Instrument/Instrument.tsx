import type { RouteComponentProps } from "@reach/router";
import React from "react";
import styled from "styled-components";

import type { IInstrument } from "#src/types";

const imgMaxWidth = "400px";
const imgMaxHeight = "600px";

const InstrumentContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;

  .img-container {
    order: -1;
    flex: 0 0 auto;
    width: 50vw;
    max-width: ${imgMaxWidth};
    max-height: ${imgMaxHeight};
  }

  h2 {
    flex: 1;
    margin: 1em;
    text-align: center;
    font-size: 2em;
  }

  h2 ~ * {
    flex-basis: 100%;
  }

  @media (min-width: ${({ theme }) => theme.mobileBreakpoint}) {
    display: block;

    h2 {
      margin: 0 0 1.5rem;
    }

    .img-container {
      float: left;
      margin-right: 1rem;
      margin-bottom: 1rem;
      width: ${imgMaxWidth};
      max-width: none;
      max-height: none;
    }
  }
`;

export type InstrumentProps = Pick<
  IInstrument,
  "name" | "summary" | "description" | "imageUrl"
>;

export function Instrument({
  name,
  summary,
  description,
  imageUrl,
}: InstrumentProps & RouteComponentProps): JSX.Element {
  return (
    <InstrumentContainer>
      <h2>{name}</h2>
      <div className="img-container">
        <img src={imageUrl} alt={name} />
      </div>
      <p>{summary}</p>
      <hr />
      <p>{description}</p>
    </InstrumentContainer>
  );
}

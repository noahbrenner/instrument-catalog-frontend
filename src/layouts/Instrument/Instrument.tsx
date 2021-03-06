import type { RouteComponentProps } from "@reach/router";
import React from "react";
import styled from "styled-components";

import { DeleteInstrumentButton } from "#components/DeleteInstrumentButton";
import { EditInstrumentButton } from "#components/EditInstrumentButton";
import { useAuth } from "#hooks/useAuth";
import type { IInstrument } from "#src/types";
import { canEditOrDelete } from "#utils/access_control";

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

  .button-container {
    display: flex;
    justify-content: space-around;
    margin: 1em 0 0.5em;
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

    .button-container {
      flex-flow: row wrap;
      justify-content: center;
      margin: 0;

      & > button {
        margin: 0 0.5em 1em;
      }
    }
  }
`;

export type InstrumentProps = Pick<
  IInstrument,
  "id" | "userId" | "name" | "summary" | "description" | "imageUrl"
> & {
  categoryName: string;
};

export function Instrument({
  id,
  userId,
  name,
  categoryName,
  summary,
  description,
  imageUrl,
}: InstrumentProps & RouteComponentProps): JSX.Element {
  const auth = useAuth();
  const userCanModify =
    auth.state === "AUTHENTICATED" && canEditOrDelete(auth.user, { userId });

  return (
    <InstrumentContainer>
      <h2>{name}</h2>
      <div className="img-container">
        <img src={imageUrl} alt={name} />
      </div>
      {userCanModify && (
        <div className="button-container">
          <EditInstrumentButton id={id} name={name} />
          <DeleteInstrumentButton id={id} name={name} />
        </div>
      )}
      <p>{summary}</p>
      <p>
        <strong>Category:</strong> {categoryName}
      </p>
      <hr />
      <p>{description}</p>
    </InstrumentContainer>
  );
}

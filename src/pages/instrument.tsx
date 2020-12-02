import { useNavigate, useParams } from "@reach/router";
import type { RouteComponentProps } from "@reach/router";
import React, { useEffect, useState } from "react";

import { api } from "#api";
import type { APIError } from "#api";
import { Instrument } from "#layouts/Instrument";
import NotFound from "#src/pages/404";
import type { IInstrument } from "#src/types";

interface InstrumentPageProps {
  instrumentId: string; // An integer, but the router passes it as a string
}

/**
 * This page's path: /instruments/<instrumentId>/<instrumentName>/
 *
 * - e.g. /instruments/4/Double%20Bass/
 * - `instrumentId` is canonical
 * - `instrumentName` helps with readability and SEO, but it can be changed
 *
 * The URL will be updated if `instrumentName` is missing or incorrect, so both
 * /instruments/4/ and /instruments/4/wrongname/ will be correctly redirected
 */
export default function InstrumentPage(_: RouteComponentProps): JSX.Element {
  const { instrumentId } = useParams() as InstrumentPageProps;
  const [loadingMessage, setLoadingMessage] = useState("...Loading");
  const [instrument, setInstrument] = useState<IInstrument>();
  const [instrumentExists, setInstrumentExists] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!instrumentId.match(/^[0-9]+$/)) {
      setInstrumentExists(false);
    } else if (instrument && instrument.id === Number(instrumentId)) {
      // Make sure the URL reflects the correct instrument name & ends with "/"
      const encodedName = encodeURIComponent(instrument.name);
      const canonicalPath = `/instruments/${instrument.id}/${encodedName}/`;
      if (window.location.pathname !== canonicalPath) {
        navigate(canonicalPath, { replace: true });
      }
    } else {
      // Reset the state before fetching new instrument data
      setLoadingMessage("...Loading");
      setInstrument(undefined);
      setInstrumentExists(true); // Hide 404 unless we *know* it doesn't exist

      api.getInstrumentById(Number(instrumentId)).then(
        ({ data }) => {
          setInstrument(data);
        },
        (err: APIError) => {
          if (err.response?.status === 404) {
            setInstrumentExists(false);
          } else {
            setLoadingMessage(err.uiErrorMessage);
          }
        }
      );
    }
  }, [instrumentId, instrument, window.location.pathname]);

  if (!instrumentExists) {
    return <NotFound />;
  }

  return instrument ? (
    <Instrument
      name={instrument.name}
      summary={instrument.summary}
      description={instrument.description}
    />
  ) : (
    <p>{loadingMessage}</p>
  );
}

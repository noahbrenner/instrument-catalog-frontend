import { Router, useLocation, useNavigate, useParams } from "@reach/router";
import type { RouteComponentProps } from "@reach/router";
import React, { useEffect, useState } from "react";

import { getInstrumentById } from "#api";
import { Instrument } from "#layouts/Instrument";
import { InstrumentForm } from "#layouts/InstrumentForm";
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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!instrumentId.match(/^[0-9]+$/)) {
      setInstrumentExists(false);
      return;
    }

    // Make sure the URL reflects the correct instrument name and ends with "/"
    if (instrument && instrument.id === Number(instrumentId)) {
      const encodedName = encodeURIComponent(instrument.name);
      const canonicalPath = location.pathname.match(/\/edit\/?$/)
        ? `/instruments/${instrument.id}/${encodedName}/edit/`
        : `/instruments/${instrument.id}/${encodedName}/`;
      if (location.pathname !== canonicalPath) {
        navigate(canonicalPath, { replace: true });
      }
      return;
    }

    // Reset the state before fetching new instrument data
    setLoadingMessage("...Loading");
    setInstrument(undefined);
    setInstrumentExists(true); // Hide 404 unless we *know* it doesn't exist

    const { cancel } = getInstrumentById(Number(instrumentId), {
      onSuccess(instrumentData) {
        setInstrument(instrumentData);
      },
      onError(uiErrorMessage, err) {
        if (err.response?.status === 404) {
          setInstrumentExists(false);
        } else {
          setLoadingMessage(uiErrorMessage);
        }
      },
    });

    return cancel;
  }, [instrumentId, instrument, location.pathname]);

  if (!instrumentExists) {
    return <NotFound />;
  }

  return instrument ? (
    <Router
      basepath={`/instruments/${instrument.id}/${encodeURIComponent(
        instrument.name
      )}/`}
    >
      <Instrument
        path="/"
        name={instrument.name}
        summary={instrument.summary}
        description={instrument.description}
        imageUrl={instrument.imageUrl}
      />
      <InstrumentForm
        path="edit"
        id={instrument.id}
        categoryId={instrument.categoryId}
        name={instrument.name}
        summary={instrument.summary}
        description={instrument.description}
        imageUrl={instrument.imageUrl}
      />
      <NotFound default />
    </Router>
  ) : (
    <p>{loadingMessage}</p>
  );
}

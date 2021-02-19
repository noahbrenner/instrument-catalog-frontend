import { Link, useLocation, useNavigate, useParams } from "@reach/router";
import type { RouteComponentProps } from "@reach/router";
import React, { Suspense, useEffect, useState } from "react";

import { getInstrumentById } from "#api";
import { LoginButton } from "#components/LoginButton";
import { useAuth } from "#hooks/useAuth";
import NotFound from "#src/pages/404";
import type { IInstrument } from "#src/types";
import { canEditOrDelete } from "#utils/access_control";
import { getInstrumentPath } from "#utils/paths";
import { lazyNamed } from "#utils/lazy_named";

const Instrument = lazyNamed(() => import("#layouts/Instrument"), "Instrument");
const InstrumentForm = lazyNamed(
  () => import("#layouts/InstrumentForm"),
  "InstrumentForm"
);

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
  const [instrument, setInstrument] = useState<IInstrument | undefined>();
  const [instrumentExists, setInstrumentExists] = useState(true);
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isEditPage = /\/edit\/?$/.test(location.pathname);

  useEffect(() => {
    if (!instrumentId.match(/^[0-9]+$/)) {
      setInstrumentExists(false);
      return;
    }

    // Make sure the URL reflects the correct instrument name and ends with "/"
    if (instrument && instrument.id === Number(instrumentId)) {
      const canonicalPath = getInstrumentPath(instrument, isEditPage);
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

  if (!instrument) {
    return <p>{loadingMessage}</p>;
  }

  if (isEditPage) {
    switch (auth.state) {
      case "LOADING":
        return <p>{loadingMessage}</p>;
      case "AUTHENTICATED":
        return canEditOrDelete(auth.user, instrument) ? (
          <Suspense fallback={<p>{loadingMessage}</p>}>
            <InstrumentForm
              path="edit"
              id={instrument.id}
              categoryId={instrument.categoryId}
              name={instrument.name}
              summary={instrument.summary}
              description={instrument.description}
              imageUrl={instrument.imageUrl}
            />
          </Suspense>
        ) : (
          <>
            <h2>Not Permitted</h2>
            <p>You can only edit instruments that you created.</p>
            <p>
              <Link to={getInstrumentPath(instrument)}>
                Back to page: {instrument.name}
              </Link>
            </p>
          </>
        );
      default:
        return (
          <>
            <h2>Not Permitted</h2>
            <p>You need to log in before you can edit your instruments.</p>
            <LoginButton />
            <p>
              <Link to={getInstrumentPath(instrument)}>
                Back to page: {instrument.name}
              </Link>
            </p>
          </>
        );
    }
  }

  return (
    <Suspense fallback={<p>{loadingMessage}</p>}>
      <Instrument
        path="/"
        name={instrument.name}
        summary={instrument.summary}
        description={instrument.description}
        imageUrl={instrument.imageUrl}
      />
    </Suspense>
  );
}

import { useEffect, useState } from "react";

import { getCategories } from "#api";
import type { ICategory } from "#src/types";

// Categories change rarely, if ever, so we can fetch them once per site visit
let cachedCategories: ICategory[] = [];
let cachedErrorMessage: string | undefined;
let categoriesHaveLoaded = false;
let requestInProgress: Promise<void> | undefined;
let resolvePromise: () => void;

/** This function is only meant for use in testing! It is not tested itself */
export function resetCache(): void {
  cachedCategories = [];
  cachedErrorMessage = undefined;
  categoriesHaveLoaded = false;
  requestInProgress = undefined;
}

/** Provides the cached array of categories, only fetched once per app load */
export function useCategories(): {
  categories: ICategory[];
  categoriesHaveLoaded: boolean;
  errorMessage: string | undefined;
} {
  const [categories, setCategories] = useState(cachedCategories);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    cachedErrorMessage
  );

  useEffect(() => {
    if (categoriesHaveLoaded) {
      return;
    }

    let componentIsMounted = true;

    if (requestInProgress) {
      requestInProgress.then(() => {
        if (componentIsMounted) {
          setCategories(cachedCategories);
          setErrorMessage(cachedErrorMessage);
        }
      });
    } else {
      (function updateCategories() {
        // An observable would be better for keeping multiple components in
        // sync, but a promise handles most cases well enough. The main
        // inconsistent state occurs with this implementation when:
        // - At least 2 components use the hook before the request succeeds
        // - AND the request initially fails, but not with a 404 status code
        //
        // When this happens, the initially mounted components (other than the
        // first one) will not reflect the error state. The request will be
        // retried and the components *will* get back in sync if/when the
        // retried request eventually succeeds or it fails with a 404 status.
        //
        // Any components mounted *after* the initial request receives a
        // response (successful or not) will reflect the current state *and*
        // will update once a retried request succeeds or receives a 404.
        if (!requestInProgress) {
          requestInProgress = new Promise((resolve) => {
            resolvePromise = resolve;
          });
        }

        getCategories({
          onSuccess(data) {
            cachedCategories = data.categories;
            cachedErrorMessage = undefined;
            categoriesHaveLoaded = true;
            resolvePromise();

            if (componentIsMounted) {
              setCategories(data.categories);
              setErrorMessage(undefined);
            }
          },
          onError(uiErrorMessage, error) {
            cachedErrorMessage = uiErrorMessage;

            if (componentIsMounted) {
              setErrorMessage(uiErrorMessage);
            }

            if (error.response?.status === 404) {
              // We know for certain that the data doesn't exist on the server
              resolvePromise();
            } else {
              // Try *really* hard to populate this data
              setTimeout(updateCategories, 5000);
            }
          },
        });
      })();
    }

    return () => {
      componentIsMounted = false;
    };
  }, []);

  return { categories, categoriesHaveLoaded, errorMessage };
}

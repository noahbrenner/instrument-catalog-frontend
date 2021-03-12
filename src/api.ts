import type { Auth0ContextInterface, OAuthError } from "@auth0/auth0-react";
import axios from "axios";
import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  Canceler,
} from "axios";
import axiosRetry, {
  exponentialDelay,
  isNetworkOrIdempotentRequestError,
} from "axios-retry";

import { ENDPOINTS } from "#api_endpoints";
import type {
  ICategories,
  ICategory,
  IInstrument,
  IInstruments,
} from "#src/types";

axiosRetry(axios, {
  retries: 3,
  retryCondition: isNetworkOrIdempotentRequestError,
  retryDelay: exponentialDelay,
});

function getUiErrorMessage(err: AxiosError<{ error?: string }>) {
  let message: string;

  if (err.response) {
    const { data, status, statusText } = err.response;
    message = `Error from server: "${status} ${statusText}". `;
    message += data.error ?? "Please send a bug report!";
  } else if (err.request) {
    message = "Couldn't reach the server. Please try reloading in a minute.";
  } else {
    message = `Unknown error: ${err.message}\n${err.toString()}\n${err.stack}`;
  }

  return message;
}

export type RequestParams = AxiosRequestConfig &
  Required<Pick<AxiosRequestConfig, "url" | "method">>;

export interface APIHandlers<T> {
  onSuccess: (data: T) => unknown;
  onError: (uiErrorMessage: string, error: AxiosError) => unknown;
}

export interface AuthenticatedAPIHandlers<T> extends APIHandlers<T> {
  onError: (
    uiErrorMessage: string,
    error: AxiosError<{ error?: string } | undefined> | OAuthError
  ) => unknown;
}

export interface APIUtils {
  /** Cancel the request and prevent handlers from being called */
  cancel: Canceler;
  /** Resolves when the request is completed, failed, or cancelled */
  completed: Promise<void>;
}

export function baseRequest<T>(
  { onSuccess, onError }: APIHandlers<T>,
  axiosParams: RequestParams
): APIUtils {
  const { token, cancel } = axios.CancelToken.source();

  const completed = new Promise<void>((resolve) => {
    axios({ ...axiosParams, cancelToken: token }).then(
      ({ data }: AxiosResponse<T>) => {
        resolve();
        onSuccess(data);
      },
      (err) => {
        resolve();
        if (!axios.isCancel(err)) {
          onError(getUiErrorMessage(err), err);
        }
      }
    );
  });

  return { cancel, completed };
}

export function baseAuthenticatedRequest<T>(
  getAccessTokenSilently: Auth0ContextInterface["getAccessTokenSilently"],
  handlers: AuthenticatedAPIHandlers<T>,
  axiosParams: RequestParams
): APIUtils {
  let isCancelled = false;
  let baseRequestCancel: () => void;
  const cancel = (): void => {
    baseRequestCancel?.();
    isCancelled = true;
  };

  const completed = new Promise<void>((resolve) => {
    getAccessTokenSilently().then(
      (accessToken) => {
        if (isCancelled) {
          resolve();
        } else {
          const request = baseRequest(handlers, {
            ...axiosParams,
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          baseRequestCancel = request.cancel;
          request.completed.then(resolve, resolve);
        }
      },
      (err: OAuthError) => {
        resolve();
        if (!isCancelled) {
          let message = `Error authenticating your request: "${err.error}". `;
          message += "Try logging out and back in again.";
          handlers.onError(message, err);
        }
      }
    );
  });

  return { cancel, completed };
}

export const { isAxiosError } = axios;

/* CATEGORIES */

/** You probably want "#hooks/useCategories" instead of this function */
export function getCategories(handlers: APIHandlers<ICategories>): APIUtils {
  return baseRequest(handlers, {
    method: "GET",
    url: `${ENDPOINTS.categories}/all`,
  });
}

export function getCategoryBySlug(
  slug: string,
  handlers: APIHandlers<ICategory>
): APIUtils {
  return baseRequest(handlers, {
    method: "GET",
    url: `${ENDPOINTS.categories}/${slug}`,
  });
}

/* INSTRUMENTS */

export function getInstruments(handlers: APIHandlers<IInstruments>): APIUtils {
  return baseRequest(handlers, {
    method: "GET",
    url: `${ENDPOINTS.instruments}/all`,
  });
}

export function getInstrumentsByCategoryId(
  categoryId: number,
  handlers: APIHandlers<IInstruments>
): APIUtils {
  return baseRequest(handlers, {
    method: "GET",
    url: ENDPOINTS.instruments,
    params: { cat: categoryId },
  });
}

export function getInstrumentById(
  id: number,
  handlers: APIHandlers<IInstrument>
): APIUtils {
  return baseRequest(handlers, {
    method: "GET",
    url: `${ENDPOINTS.instruments}/${id}`,
  });
}

export function createInstrument(
  newInstrument: Omit<IInstrument, "id" | "userId">,
  getAccessTokenSilently: Auth0ContextInterface["getAccessTokenSilently"],
  handlers: AuthenticatedAPIHandlers<IInstrument>
): APIUtils {
  return baseAuthenticatedRequest(getAccessTokenSilently, handlers, {
    method: "POST",
    url: ENDPOINTS.instruments,
    data: newInstrument,
  });
}

export function updateInstrument(
  id: number,
  newData: Omit<IInstrument, "id" | "userId">,
  getAccessTokenSilently: Auth0ContextInterface["getAccessTokenSilently"],
  handlers: AuthenticatedAPIHandlers<IInstrument>
): APIUtils {
  return baseAuthenticatedRequest(getAccessTokenSilently, handlers, {
    method: "PUT",
    url: `${ENDPOINTS.instruments}/${id}`,
    data: newData,
  });
}

export function deleteInstrument(
  id: number,
  getAccessTokenSilently: Auth0ContextInterface["getAccessTokenSilently"],
  handlers: AuthenticatedAPIHandlers<void>
): APIUtils {
  return baseAuthenticatedRequest(getAccessTokenSilently, handlers, {
    method: "DELETE",
    url: `${ENDPOINTS.instruments}/${id}`,
  });
}

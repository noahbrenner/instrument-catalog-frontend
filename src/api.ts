import axios from "axios";
import type { AxiosError, AxiosResponse } from "axios";
import axiosRetry, {
  exponentialDelay,
  isNetworkOrIdempotentRequestError,
} from "axios-retry";

import { ENDPOINTS } from "#api_endpoints";
import type { ICategories, ICategory, IUsers } from "#src/types";

export interface APIError extends AxiosError {
  uiErrorMessage: string;
}

axiosRetry(axios, {
  retries: 3,
  retryCondition: isNetworkOrIdempotentRequestError,
  retryDelay: exponentialDelay,
});

// This function always throws, but we specify a return type so that tsc doesn't
// include `void` in the the type for the `api.foo().then()` handler's parameter
function errorHandler(err: AxiosError): AxiosResponse {
  let message: string;

  if (err.response) {
    const { status, statusText } = err.response;
    message =
      `Error from server: "${status} ${statusText}".` +
      " Please send a bug report!";
  } else if (err.request) {
    message = "Couldn't reach the server. Please try reloading in a minute.";
  } else {
    message = `Unknown error: ${err.message}\n${err.toString()}\n${err.stack}`;
  }

  // eslint-disable-next-line no-param-reassign
  (err as APIError).uiErrorMessage = message;
  throw err;
}

/* eslint-disable @typescript-eslint/explicit-module-boundary-types
   --
   The inferred types include the type of the AJAX response object for each
   endpoint (e.g.  ICategories), which is more valuable than either a more
   generic type or the clutter of defining each endpoint's type explicitly
*/
export const api = {
  getCategories() {
    return axios
      .get<ICategories>(ENDPOINTS.categories)
      .catch<AxiosResponse<ICategories>>(errorHandler);
  },
  getCategoryBySlug(slug: string) {
    return axios
      .get<ICategory>(`${ENDPOINTS.categories}/${slug}`)
      .catch<AxiosResponse<ICategory>>(errorHandler);
  },

  getUsers() {
    return axios
      .get<IUsers>(ENDPOINTS.users)
      .catch<AxiosResponse<IUsers>>(errorHandler);
  },
} as const;

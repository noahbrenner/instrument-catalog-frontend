const { API_ROOT } = process.env;

export const ENDPOINTS = {
  categories: `${API_ROOT}/categories`,
  instruments: `${API_ROOT}/instruments`,
} as const;

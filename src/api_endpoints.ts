const { API_ROOT } = process.env;

export const ENDPOINTS = {
  categories: `${API_ROOT}/categories`,
  users: `${API_ROOT}/users/all`,
} as const;

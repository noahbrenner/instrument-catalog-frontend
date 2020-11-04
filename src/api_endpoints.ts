const { API_ROOT } = process.env;

export const ENDPOINTS = {
  categories: `${API_ROOT}/categories`,
  category: `${API_ROOT}/category`,
  users: `${API_ROOT}/users/all`,
} as const;

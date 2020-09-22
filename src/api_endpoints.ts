const { API_ROOT } = process.env;

export const ENDPOINTS = {
  users: `${API_ROOT}/users/all`,
} as const;

const BASE_URL = import.meta.env.VITE_API_URL || "";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/api/login`,
    LOGOUT: `${BASE_URL}/api/logout`,
    REGISTER: `${BASE_URL}/api/register`,
    ME: `${BASE_URL}/api/me`,
  },
  BLOG: {
    BASE: `${BASE_URL}/api/blogs`,
    GENERATE: `${BASE_URL}/api/blogs/generate`,
    BY_ID: (id: string | number) => `${BASE_URL}/api/blogs/${id}`,
    VIEW_BY_ID: (id: string | number) => `${BASE_URL}/api/blogs/${id}/view`,
    PREVIEW: (id: string | number) => `${BASE_URL}/api/blogs/preview/${id}`,
    REGENERATE_IMAGE: (id: string | number) => `${BASE_URL}/api/blogs/${id}/regenerate-image`,
    REGENERATE_FULL: (id: string | number) => `${BASE_URL}/api/blogs/${id}/regenerate-full`,
  },
  TRENDS: {
    GET: `${BASE_URL}/api/trends`,
    REFRESH: `${BASE_URL}/api/trends/refresh`,
  },
  ADMIN: {
    USERS: `${BASE_URL}/api/admin/users`,
    GLOBAL_STATS: `${BASE_URL}/api/admin/global-stats`,
    SEND_CREDENTIALS: (id: string | number) => `${BASE_URL}/api/admin/users/${id}/send-credentials`,
    IMPERSONATE: (id: string | number) => `${BASE_URL}/api/admin/impersonate/${id}`,
    DELETE_USER: (id: string | number) => `${BASE_URL}/api/admin/users/${id}`,
  },
  SETTINGS: {
    EXTERNAL_SITES: `${BASE_URL}/api/sites`,
    EXTERNAL_SITES_CRUD: (id: string | number) => `${BASE_URL}/api/sites/${id}`,
    TEST_CONNECTION: (id: string | number) => `${BASE_URL}/api/external-sites/${id}/test`,
    SCHEDULE_POST: `${BASE_URL}/api/scheduled`,
    SCHEDULE_POST_CRUD: (id: string | number) => `${BASE_URL}/api/scheduled/${id}`,
  },
};

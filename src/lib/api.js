const API_BASE_URL = "http://185.200.244.215:4445/api";

const getAccessToken = () => localStorage.getItem("accessToken");

export const apiClient = {
  get: async (url, options = {}) => {
    const token = getAccessToken();
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  },

  post: async (url, body, options = {}) => {
    const token = getAccessToken();
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      body: JSON.stringify(body),
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  },

  put: async (url, body, options = {}) => {
    const token = getAccessToken();
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      body: JSON.stringify(body),
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  },

  patch: async (url, body, options = {}) => {
    const token = getAccessToken();
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      body: JSON.stringify(body),
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  },

  del: async (url, options = {}) => {
    const token = getAccessToken();
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });
    if (res.status === 204) return { ok: true, status: res.status, data: null };
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  },
};
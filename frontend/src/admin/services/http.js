import { useAuthStore } from "../store/authStore.js";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const parseResponse = async (response) => {
  const raw = await response.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch (error) {
    data = raw;
  }
  return { status: response.status, data };
};

const request = async (path, options = {}, retry = true) => {
  const { accessToken, refreshToken, setTokens, logout } = useAuthStore.getState();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (response.status !== 401 || !retry || !refreshToken) {
    return parseResponse(response);
  }

  const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });
  const refreshData = await parseResponse(refreshResponse);
  const newAccess = refreshData.data?.data?.accessToken;
  const newRefresh = refreshData.data?.data?.refreshToken;
  if (refreshResponse.status >= 200 && refreshResponse.status < 300 && newAccess && newRefresh) {
    setTokens(newAccess, newRefresh);
    return request(path, options, false);
  }
  logout();
  return parseResponse(response);
};

export const http = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" })
};

import { getToken } from "./auth.js";

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

const request = async (url, options) => {
  try {
    const response = await fetch(url, options);
    return parseResponse(response);
  } catch (error) {
    return {
      status: 0,
      data: { message: error?.message || "Không thể kết nối đến máy chủ." }
    };
  }
};

export const registerUser = async (payload) => {
  return request(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
};

export const loginUser = async (payload) => {
  return request(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
};

const withAuth = (headers = {}) => {
  const token = getToken();
  if (!token) {
    return headers;
  }
  return { ...headers, Authorization: `Bearer ${token}` };
};

export const getOrders = async () => {
  return request(`${API_BASE}/orders`, { headers: withAuth() });
};

export const createOrder = async (payload) => {
  return request(`${API_BASE}/orders`, {
    method: "POST",
    headers: withAuth({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
};

export const updateOrderStatus = async (id, status) => {
  return request(`${API_BASE}/orders/${id}/status?status=${status}`, {
    method: "PATCH",
    headers: withAuth()
  });
};

export const getCategories = async () => {
  return request(`${API_BASE}/categories`);
};

export const getProducts = async (categoryId) => {
  const query = categoryId ? `?categoryId=${categoryId}` : "";
  return request(`${API_BASE}/products${query}`);
};

export const getProductById = async (id) => {
  return request(`${API_BASE}/products/${id}`);
};

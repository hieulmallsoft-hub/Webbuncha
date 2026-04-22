import { getToken } from "./auth.js";

const API_BASE = import.meta.env.VITE_API_BASE || "";

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

const normalizeEmail = (value) => {
  if (typeof value !== "string") {
    return value;
  }
  return value.trim().toLowerCase();
};

export const registerUser = async (payload) => {
  return request(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      email: normalizeEmail(payload?.email),
      phone: typeof payload?.phone === "string" ? payload.phone.trim().replace(/\s+/g, "") : payload?.phone
    })
  });
};

export const loginUser = async (payload) => {
  return request(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      email: normalizeEmail(payload?.email)
    })
  });
};

export const forgotPassword = async (payload) => {
  return request(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      phone: typeof payload?.phone === "string" ? payload.phone.trim().replace(/\s+/g, "") : payload?.phone
    })
  });
};

export const resetPassword = async (payload) => {
  return request(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      phone: typeof payload?.phone === "string" ? payload.phone.trim().replace(/\s+/g, "") : payload?.phone
    })
  });
};

export const verifyEmail = async (token) => {
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return request(`${API_BASE}/auth/verify-email${query}`, {
    method: "GET"
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

export const getOrderById = async (id) => {
  return request(`${API_BASE}/orders/${id}`, { headers: withAuth() });
};

export const createOrder = async (payload) => {
  return request(`${API_BASE}/orders`, {
    method: "POST",
    headers: withAuth({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
};

export const createVnpayPaymentUrl = async (orderId) => {
  return request(`${API_BASE}/payments/vnpay/${orderId}`, {
    method: "POST",
    headers: withAuth()
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

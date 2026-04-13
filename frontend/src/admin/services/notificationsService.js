import { http } from "./http.js";
import { useAuthStore } from "../store/authStore.js";

const toError = (res, fallback) => res.data?.message || fallback;
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export const notificationsService = {
  async list() {
    const res = await http.get("/notifications");
    if (res.status >= 200 && res.status < 300) {
      return { ok: true, data: res.data?.data || [] };
    }
    return { ok: false, data: [], error: toError(res, "Không thể tải thông báo.") };
  },
  async create(payload) {
    const res = await http.post("/notifications", payload);
    if (res.status >= 200 && res.status < 300) {
      return { ok: true, data: res.data?.data };
    }
    return { ok: false, error: toError(res, "Không thể tạo thông báo.") };
  },
  async update(id, payload) {
    const res = await http.put(`/notifications/${id}`, payload);
    if (res.status >= 200 && res.status < 300) {
      return { ok: true, data: res.data?.data };
    }
    return { ok: false, error: toError(res, "Không thể cập nhật thông báo.") };
  },
  async remove(id) {
    const res = await http.delete(`/notifications/${id}`);
    if (res.status >= 200 && res.status < 300) {
      return { ok: true };
    }
    return { ok: false, error: toError(res, "Không thể xóa thông báo.") };
  },
  subscribe(onMessage) {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      return () => {};
    }

    const url = `${API_BASE}/notifications/stream?token=${encodeURIComponent(token)}`;
    const source = new EventSource(url);

    source.onmessage = (event) => {
      if (!onMessage) return;
      try {
        const data = event?.data ? JSON.parse(event.data) : null;
        onMessage(data);
      } catch (error) {
        onMessage(event?.data);
      }
    };

    source.onerror = () => {
      // Browser will retry automatically; keep open.
    };

    return () => source.close();
  }
};

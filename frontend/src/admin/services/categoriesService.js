import { http } from "./http.js";

const toError = (res, fallback) => res.data?.message || fallback;

export const categoriesService = {
  async list() {
    const res = await http.get("/categories");
    if (res.status >= 200 && res.status < 300) {
      return { ok: true, data: res.data?.data || [] };
    }
    return { ok: false, data: [], error: toError(res, "Không thể tải danh mục.") };
  },
  async create(payload) {
    const res = await http.post("/categories", payload);
    if (res.status >= 200 && res.status < 300) {
      return { ok: true, data: res.data?.data };
    }
    return { ok: false, error: toError(res, "Không thể tạo danh mục.") };
  },
  async update(id, payload) {
    const res = await http.put(`/categories/${id}`, payload);
    if (res.status >= 200 && res.status < 300) {
      return { ok: true, data: res.data?.data };
    }
    return { ok: false, error: toError(res, "Không thể cập nhật danh mục.") };
  },
  async remove(id) {
    const res = await http.delete(`/categories/${id}`);
    if (res.status >= 200 && res.status < 300) {
      return { ok: true };
    }
    return { ok: false, error: toError(res, "Không thể xóa danh mục.") };
  }
};

import { http } from "./http.js";

const toError = (res, fallback) => res.data?.message || fallback;

export const productsService = {
  async list() {
    const res = await http.get("/products");
    if (res.status >= 200 && res.status < 300) {
      const data = (res.data?.data || []).map((item) => ({
        ...item,
        categoryId: item.categoryId != null ? String(item.categoryId) : ""
      }));
      return { ok: true, data };
    }
    return { ok: false, data: [], error: toError(res, "Không thể tải sản phẩm.") };
  },
  async create(payload) {
    const res = await http.post("/products", payload);
    if (res.status >= 200 && res.status < 300) {
      return { ok: true, data: res.data?.data };
    }
    return { ok: false, error: toError(res, "Không thể tạo sản phẩm.") };
  },
  async update(id, payload) {
    const res = await http.put(`/products/${id}`, payload);
    if (res.status >= 200 && res.status < 300) {
      return { ok: true, data: res.data?.data };
    }
    return { ok: false, error: toError(res, "Không thể cập nhật sản phẩm.") };
  },
  async remove(id) {
    const res = await http.delete(`/products/${id}`);
    if (res.status >= 200 && res.status < 300) {
      return { ok: true };
    }
    return { ok: false, error: toError(res, "Không thể xóa sản phẩm.") };
  }
};

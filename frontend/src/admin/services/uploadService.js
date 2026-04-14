import { http } from "./http.js";

const toError = (res, fallback) => res.data?.message || fallback;

export const uploadService = {
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await http.postFormData("/uploads/images", formData);
    if (res.status >= 200 && res.status < 300) {
      return { ok: true, data: res.data?.data };
    }

    return { ok: false, error: toError(res, "Khong the tai anh len.") };
  }
};

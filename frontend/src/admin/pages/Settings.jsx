import { useState } from "react";
import { useUiStore } from "../store/uiStore.js";

const SETTINGS_KEY = "admin_settings";

const loadSettings = () => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return {
      systemName: "Bún Chả Chinh Hương",
      hotline: "0904 888 686",
      email: "hello@bunchachinhhuong.vn",
      address: "Số 8 Trần Phú, Phường Bỉm Sơn, Thanh Hóa"
    };
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
};

export default function Settings() {
  const [form, setForm] = useState(loadSettings());
  const addToast = useUiStore((state) => state.addToast);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(form));
    addToast({ type: "success", title: "Đã lưu", message: "Cập nhật cấu hình hệ thống thành công." });
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h3 className="font-display text-2xl">Cài đặt hệ thống</h3>
        <p className="text-sm text-ink/60">Thiết lập thông tin hiển thị chung.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="admin-label">Tên hệ thống</label>
            <input className="admin-input" value={form.systemName || ""} onChange={handleChange("systemName")} />
          </div>
          <div>
            <label className="admin-label">Hotline</label>
            <input className="admin-input" value={form.hotline || ""} onChange={handleChange("hotline")} />
          </div>
          <div>
            <label className="admin-label">Email</label>
            <input className="admin-input" value={form.email || ""} onChange={handleChange("email")} />
          </div>
          <div>
            <label className="admin-label">Địa chỉ</label>
            <input className="admin-input" value={form.address || ""} onChange={handleChange("address")} />
          </div>
        </div>
        <button className="admin-button primary mt-6" type="button" onClick={handleSave}>
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

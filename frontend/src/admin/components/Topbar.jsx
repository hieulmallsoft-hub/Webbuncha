import { useNavigate } from "react-router-dom";
import { logoutAdmin } from "../services/authService.js";
import { useAuthStore } from "../store/authStore.js";

export default function Topbar() {
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  return (
    <header className="admin-topbar">
      <div>
        <h1 className="font-display text-xl text-ink">Admin Dashboard</h1>
        <p className="text-xs text-ink/50">Quản trị hệ thống đặt món</p>
      </div>
      <div className="admin-topbar-actions">
        <input className="admin-input" placeholder="Tìm kiếm nhanh..." />
        <button className="admin-icon-button" type="button" aria-label="Notifications">
          🔔
        </button>
        <div className="admin-profile">
          <div>
            <p className="text-sm font-semibold">{profile?.sub || "Admin"}</p>
            <p className="text-xs text-ink/50">{profile?.roles?.join(", ") || "ADMIN"}</p>
          </div>
          <button className="admin-button ghost" type="button" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}

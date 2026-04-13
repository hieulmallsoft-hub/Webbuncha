import { NavLink } from "react-router-dom";
import { adminNav } from "../config/nav.js";
import { useAuthStore } from "../store/authStore.js";
import { hasPermission } from "../config/permissions.js";

export default function Sidebar() {
  const profile = useAuthStore((state) => state.profile);
  const roles = (profile?.roles || ["ROLE_ADMIN"]).map((role) => role.replace("ROLE_", ""));

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Admin</p>
          <h2 className="font-display text-2xl text-white">Chinh Hương</h2>
        </div>
      </div>
      <nav className="admin-nav">
        {adminNav.map((group) => (
          <div key={group.label} className="admin-nav-group">
            <p className="admin-nav-label">{group.label}</p>
            <div className="admin-nav-list">
              {group.items
                .filter((item) => !item.permission || hasPermission(roles, item.permission))
                .map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `admin-nav-item ${isActive ? "is-active" : ""}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

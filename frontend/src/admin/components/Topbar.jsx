import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutAdmin } from "../services/authService.js";
import { useAuthStore } from "../store/authStore.js";
import { useNotificationStore } from "../store/notificationStore.js";

const formatTime = (value) => {
  if (!value) {
    return "";
  }
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(value));
};

export default function Topbar() {
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const [open, setOpen] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.status === "UNREAD").length,
    [notifications]
  );
  const recentNotifications = notifications.slice(0, 5);

  const handleLogout = async () => {
    await logoutAdmin();
    navigate("/admin/login");
  };

  const openNotificationsPage = () => {
    setOpen(false);
    navigate("/admin/notifications");
  };

  const handleNotificationClick = async (notification) => {
    if (notification.status === "UNREAD") {
      await markAsRead(notification.id);
    }
    openNotificationsPage();
  };

  return (
    <header className="admin-topbar">
      <div>
        <h1 className="font-display text-xl text-ink">Admin Dashboard</h1>
        <p className="text-xs text-ink/50">Quan tri he thong dat mon</p>
      </div>
      <div className="admin-topbar-actions">
        <input className="admin-input" placeholder="Tim kiem nhanh..." />
        <div className="admin-notification-menu">
          <button
            className="admin-icon-button admin-bell-button"
            type="button"
            aria-label="Thong bao"
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true">!</span>
            {unreadCount > 0 ? <span className="admin-notification-badge">{unreadCount}</span> : null}
          </button>
          {open ? (
            <div className="admin-notification-dropdown">
              <div className="admin-notification-head">
                <div>
                  <p className="admin-label">Thong bao</p>
                  <strong>{unreadCount} chua doc</strong>
                </div>
                <button className="admin-button ghost compact" type="button" onClick={markAllAsRead}>
                  Da doc
                </button>
              </div>
              <div className="admin-notification-list">
                {recentNotifications.length ? (
                  recentNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      className={`admin-notification-item ${notification.status === "UNREAD" ? "is-unread" : ""}`}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <span className="admin-notification-title">{notification.title}</span>
                      <span className="admin-notification-content">{notification.content}</span>
                      <span className="admin-notification-time">{formatTime(notification.createdAt)}</span>
                    </button>
                  ))
                ) : (
                  <p className="admin-notification-empty">Chua co thong bao.</p>
                )}
              </div>
              <button className="admin-notification-all" type="button" onClick={openNotificationsPage}>
                Xem tat ca
              </button>
            </div>
          ) : null}
        </div>
        <div className="admin-profile">
          <div>
            <p className="text-sm font-semibold">{profile?.sub || "Admin"}</p>
            <p className="text-xs text-ink/50">{profile?.roles?.join(", ") || "ADMIN"}</p>
          </div>
          <button className="admin-button ghost" type="button" onClick={handleLogout}>
            Dang xuat
          </button>
        </div>
      </div>
    </header>
  );
}

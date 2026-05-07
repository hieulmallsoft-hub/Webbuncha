import { useEffect } from "react";
import DataTable from "../components/DataTable.jsx";
import { useNotificationStore } from "../store/notificationStore.js";
import { useUiStore } from "../store/uiStore.js";

const statusLabel = {
  UNREAD: "Chua doc",
  READ: "Da doc"
};

const formatTime = (value) => {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
};

export default function Notifications() {
  const notifications = useNotificationStore((state) => state.notifications);
  const loading = useNotificationStore((state) => state.loading);
  const error = useNotificationStore((state) => state.error);
  const load = useNotificationStore((state) => state.load);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const remove = useNotificationStore((state) => state.remove);
  const addToast = useUiStore((state) => state.addToast);

  const unreadCount = notifications.filter((item) => item.status === "UNREAD").length;

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkAsRead = async (id) => {
    const res = await markAsRead(id);
    addToast({
      type: res.ok ? "success" : "error",
      title: res.ok ? "Da cap nhat" : "Cap nhat that bai",
      message: res.ok ? "Thong bao da duoc danh dau la da doc." : res.error
    });
  };

  const handleMarkAllAsRead = async () => {
    const res = await markAllAsRead();
    addToast({
      type: res.ok ? "success" : "error",
      title: res.ok ? "Da cap nhat" : "Cap nhat that bai",
      message: res.ok ? "Tat ca thong bao da duoc danh dau la da doc." : res.error
    });
  };

  const handleRemove = async (id) => {
    const res = await remove(id);
    addToast({
      type: res.ok ? "success" : "error",
      title: res.ok ? "Da xoa" : "Xoa that bai",
      message: res.ok ? "Thong bao da duoc xoa." : res.error
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl">Thong bao he thong</h3>
            <p className="text-sm text-ink/60">
              Theo doi don moi va cac thong bao realtime cho admin.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="admin-button ghost" type="button" onClick={load}>
              Tai lai
            </button>
            <button
              className="admin-button primary"
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Danh dau tat ca da doc
            </button>
          </div>
        </div>

        <div className="admin-notification-summary">
          <div>
            <span className="admin-label">Tong thong bao</span>
            <strong>{notifications.length}</strong>
          </div>
          <div>
            <span className="admin-label">Chua doc</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
        {loading ? <p className="mt-6 text-sm text-ink/60">Dang tai thong bao...</p> : null}

        <div className="mt-6">
          <DataTable
            rows={notifications}
            searchPlaceholder="Tim thong bao..."
            columns={[
              {
                key: "status",
                header: "Trang thai",
                render: (row) => (
                  <span className={`admin-status-pill ${row.status === "UNREAD" ? "warning" : "success"}`}>
                    {statusLabel[row.status] || row.status}
                  </span>
                )
              },
              { key: "title", header: "Tieu de" },
              { key: "content", header: "Noi dung" },
              { key: "createdAt", header: "Thoi gian", render: (row) => formatTime(row.createdAt) }
            ]}
            actions={(row) => (
              <div className="flex flex-wrap gap-2">
                {row.status === "UNREAD" ? (
                  <button className="admin-button ghost" type="button" onClick={() => handleMarkAsRead(row.id)}>
                    Da doc
                  </button>
                ) : null}
                <button className="admin-button danger" type="button" onClick={() => handleRemove(row.id)}>
                  Xoa
                </button>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}

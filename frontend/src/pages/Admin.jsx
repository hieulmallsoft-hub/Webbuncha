import { useEffect, useMemo, useState } from "react";
import { getOrders, updateOrderStatus } from "../lib/api.js";
import { getProfileFromToken } from "../lib/auth.js";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

const statusMeta = {
  PENDING: { label: "Chờ xác nhận", tone: "is-pending" },
  CONFIRMED: { label: "Đã xác nhận", tone: "is-confirmed" },
  PAID: { label: "Thanh toán thành công", tone: "is-paid" },
  COMPLETED: { label: "Hoàn tất", tone: "is-completed" },
  CANCELLED: { label: "Đã hủy", tone: "is-cancelled" }
};

const typeLabels = {
  DELIVERY: "Giao hàng",
  DINE_IN: "Ăn tại quán"
};

const paymentLabels = {
  COD: "Thanh toán khi nhận món",
  BANK_TRANSFER: "Chuyển khoản",
  CARD: "Thẻ ngân hàng",
  MOMO: "Ví MoMo"
};

const getNextActions = (status) => {
  switch (status) {
    case "PENDING":
      return ["CONFIRMED", "PAID", "CANCELLED"];
    case "CONFIRMED":
      return ["PAID", "CANCELLED"];
    case "PAID":
      return ["COMPLETED"];
    default:
      return [];
  }
};

export default function Admin() {
  const profile = useMemo(() => getProfileFromToken(), []);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const isAdmin =
    profile?.roles?.includes("ADMIN") || profile?.roles?.includes("ROLE_ADMIN");

  const fetchOrders = async () => {
    setLoading(true);
    const res = await getOrders();
    if (res.status >= 200 && res.status < 300) {
      const payload = res.data?.data;
      const data = Array.isArray(payload) ? payload : payload?.content || [];
      setOrders(data);
      setError("");
    } else {
      setOrders([]);
      setError(res.data?.message || "Không thể tải danh sách đơn.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      setError("Vui lòng đăng nhập để vào trang quản trị.");
      return;
    }
    if (!isAdmin) {
      setLoading(false);
      setError("Bạn không có quyền quản trị.");
      return;
    }
    fetchOrders();
  }, [profile, isAdmin]);

  const handleStatusUpdate = async (id, status) => {
    setActionMessage("");
    const res = await updateOrderStatus(id, status);
    if (res.status >= 200 && res.status < 300) {
      setActionMessage(`Đã cập nhật đơn #${id} sang ${statusMeta[status]?.label || status}.`);
      fetchOrders();
      return;
    }
    setActionMessage(res.data?.message || "Cập nhật trạng thái thất bại.");
  };

  return (
    <div className="slide-deck admin-orders">
      <section className="slide ml-section admin-list">
        <p className="ml-label">Quản lý đơn</p>
        <h3 className="mt-3 font-display text-2xl">Danh sách đơn hàng</h3>
        {actionMessage && <p className="mt-2 text-sm admin-message">{actionMessage}</p>}
        {loading && <LoadingOverlay label="Đang gom đơn hàng..." className="mt-4" />}
        {!loading && error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="mt-2 text-sm text-ink/70">Chưa có đơn nào.</p>
        )}
        {!loading && !error && orders.length > 0 && (
          <div className="mt-6 space-y-4">
            {orders.map((order) => {
              const meta = statusMeta[order.status] || statusMeta.PENDING;
              const actions = getNextActions(order.status);
              const itemList = Array.isArray(order.items) ? order.items : [];
              const quantityTotal = itemList.length
                ? itemList.reduce((sum, item) => sum + (item.quantity || 0), 0)
                : order.quantity ?? 0;
              const productLabel = itemList.length
                ? itemList
                    .map((item) => item.product)
                    .filter(Boolean)
                    .slice(0, 2)
                    .join(", ")
                : order.product;
              const extraCount = itemList.length > 2 ? itemList.length - 2 : 0;
              return (
                <div key={order.id} className="admin-order-card">
                  <div className="admin-order-head">
                    <div>
                      <strong className="block text-base">Đơn #{order.id}</strong>
                      <span className="admin-order-sub">
                        {typeLabels[order.orderType] || "Khác"} ·{" "}
                        {paymentLabels[order.paymentMethod] || "Chưa chọn"}
                      </span>
                    </div>
                    <span className={`admin-order-status ${meta.tone}`}>{meta.label}</span>
                  </div>
                  <div className="admin-order-body">
                    <div>
                      <p>
                        Món: {productLabel || "-"}
                        {extraCount > 0 ? ` +${extraCount}` : ""}
                      </p>
                      {order.orderType === "DELIVERY" ? (
                        <>
                          <p>Người nhận: {order.receiverName || "-"}</p>
                          <p>Địa chỉ: {order.deliveryAddress || "-"}</p>
                        </>
                      ) : (
                        <>
                          <p>Bàn: {order.tableNumber || "-"}</p>
                          <p>Thời gian đến: {order.reservationTime || "-"}</p>
                        </>
                      )}
                    </div>
                    <div>
                      <p>Số lượng: {quantityTotal || "-"}</p>
                      <p>SĐT: {order.receiverPhone || "-"}</p>
                    </div>
                  </div>
                  <div className="admin-order-actions">
                    {actions.length === 0 ? (
                      <span className="text-sm text-ink/60">Không còn hành động.</span>
                    ) : (
                      actions.map((status) => (
                        <button
                          key={status}
                          className="admin-action"
                          type="button"
                          onClick={() => handleStatusUpdate(order.id, status)}
                        >
                          {statusMeta[status]?.label || status}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

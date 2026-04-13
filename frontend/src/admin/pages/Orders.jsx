import { useEffect, useRef, useState } from "react";
import { ordersService } from "../services/ordersService.js";
import { useUiStore } from "../store/uiStore.js";
import { formatCurrency } from "../utils/format.js";
import LoadingOverlay from "../../components/LoadingOverlay.jsx";

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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const addToast = useUiStore((state) => state.addToast);
  const seenIdsRef = useRef(new Set());
  const initializedRef = useRef(false);

  const fetchOrders = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    const res = await ordersService.list();
    if (res.ok) {
      const payload = res.data || [];
      const data = Array.isArray(payload) ? payload : payload?.content || [];
      if (initializedRef.current) {
        const newOrders = data.filter((order) => !seenIdsRef.current.has(order.id));
        newOrders.forEach((order) => {
          addToast({
            type: "info",
            title: "\u0110\u01a1n h\u00e0ng m\u1edbi",
            message: `\u0110\u01a1n #${order.id}: ${order.product ?? order.items?.[0]?.product ?? "-"}`
          });
        });
      } else {
        initializedRef.current = true;
      }
      seenIdsRef.current = new Set(data.map((order) => order.id));
      setOrders(data);
      setError("");
    } else {
      setOrders(res.data || []);
      setError(res.error || "\u004b\u0068\u00f4ng th\u1ec3 t\u1ea3i \u0111\u01a1n.");
    }
    if (!silent) {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    let intervalId;

    const load = async () => {
      await fetchOrders();
    };

    if (active) {
      load();
      intervalId = window.setInterval(() => fetchOrders(true), 15000);
    }

    return () => {
      active = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  const handleStatus = async (id, status) => {
    const res = await ordersService.updateStatus(id, status);
    if (res.ok) {
      addToast({ type: "success", title: "Đã cập nhật", message: `Đơn #${id} → ${statusMeta[status]?.label}` });
      fetchOrders();
      return;
    }
    addToast({ type: "error", title: "Lỗi cập nhật", message: res.error || "Không thể cập nhật trạng thái." });
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl">Danh sách đơn hàng</h3>
            <p className="text-sm text-ink/60">Theo dõi và duyệt thanh toán.</p>
          </div>
          <button className="admin-button ghost" type="button" onClick={fetchOrders}>
            Làm mới
          </button>
        </div>
        {loading && <LoadingOverlay label="Đang tổng hợp đơn..." className="mt-4 admin-loader" />}
        {!loading && error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
        {!loading && orders.length === 0 && <p className="mt-4 text-sm text-ink/60">Chưa có đơn.</p>}
        <div className="mt-6 space-y-4">
          {orders.map((order) => {
            const meta = statusMeta[order.status] || statusMeta.PENDING;
            const actions = getNextActions(order.status);
            const itemList = Array.isArray(order.items) ? order.items : [];
            const quantityTotal = itemList.length
              ? itemList.reduce((sum, item) => sum + (item.quantity || 0), 0)
              : order.quantity ?? 0;
            const total =
              order.totalPrice ??
              (itemList.length
                ? itemList.reduce(
                    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
                    0
                  )
                : order.price && order.quantity
                  ? order.price * order.quantity
                  : 0);
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
                    <p>Tổng: {formatCurrency(total || 0)}</p>
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
                        onClick={() => handleStatus(order.id, status)}
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
      </div>
    </div>
  );
}

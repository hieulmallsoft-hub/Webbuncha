import { useEffect, useRef, useState } from "react";
import Modal from "../components/Modal.jsx";
import { ordersService } from "../services/ordersService.js";
import { useUiStore } from "../store/uiStore.js";
import { formatDateTime, formatPriceVnd } from "../utils/format.js";
import LoadingOverlay from "../../components/LoadingOverlay.jsx";

const statusMeta = {
  PENDING: { label: "Chờ xác nhận", tone: "is-pending", note: "Đơn đang chờ nhà hàng xác nhận." },
  CONFIRMED: { label: "Đã xác nhận", tone: "is-confirmed", note: "Bếp đã tiếp nhận và đang chuẩn bị phục vụ." },
  PAID: { label: "Thanh toán thành công", tone: "is-paid", note: "Giao dịch đã được xác nhận thành công." },
  COMPLETED: { label: "Hoàn tất", tone: "is-completed", note: "Đơn hàng đã được phục vụ hoặc giao xong." },
  CANCELLED: { label: "Đã hủy", tone: "is-cancelled", note: "Đơn hàng đã bị hủy và không tiếp tục xử lý." }
};

const typeLabels = {
  DELIVERY: "Giao hàng",
  DINE_IN: "Ăn tại quán"
};

const paymentLabels = {
  COD: "Thanh toán khi nhận món",
  BANK_TRANSFER: "Chuyển khoản",
  CARD: "Thẻ ngân hàng",
  MOMO: "Ví MoMo",
  VNPAY: "VNPay"
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

const formatText = (value, fallback = "-") => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (value !== null && value !== undefined && String(value).trim()) {
    return String(value).trim();
  }
  return fallback;
};

const getItemSubtotal = (item) => {
  const price = Number(item?.price ?? 0);
  const quantity = Number(item?.quantity ?? 0);
  if (Number.isNaN(price) || Number.isNaN(quantity)) {
    return 0;
  }
  return price * quantity;
};

const getOrderTotal = (order) => {
  if (order?.totalPrice !== null && order?.totalPrice !== undefined) {
    return order.totalPrice;
  }

  const itemList = Array.isArray(order?.items) ? order.items : [];
  if (itemList.length > 0) {
    return itemList.reduce((sum, item) => sum + getItemSubtotal(item), 0);
  }

  const price = Number(order?.price ?? 0);
  const quantity = Number(order?.quantity ?? 0);
  if (Number.isNaN(price) || Number.isNaN(quantity)) {
    return 0;
  }
  return price * quantity;
};

const getOrderQuantity = (order) => {
  const itemList = Array.isArray(order?.items) ? order.items : [];
  if (itemList.length > 0) {
    return itemList.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
  }

  return Number(order?.quantity) || 0;
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
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
            title: "Đơn hàng mới",
            message: `Đơn #${order.id}: ${order.product ?? order.items?.[0]?.product ?? "-"}`
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
      setError(res.error || "Không thể tải đơn.");
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

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailOrder(null);
    setDetailError("");
    setDetailLoading(false);
  };

  const openDetail = async (order) => {
    setDetailOpen(true);
    setDetailOrder(order);
    setDetailLoading(true);
    setDetailError("");

    const res = await ordersService.getById(order.id);
    if (res.ok) {
      setDetailOrder(res.data || order);
      setDetailLoading(false);
      return;
    }

    if (res.data) {
      setDetailOrder(res.data);
    }
    setDetailError(res.error || `Không thể tải chi tiết đơn #${order.id}.`);
    setDetailLoading(false);
  };

  const handleStatus = async (id, status) => {
    const res = await ordersService.updateStatus(id, status);
    if (res.ok) {
      addToast({ type: "success", title: "Đã cập nhật", message: `Đơn #${id} → ${statusMeta[status]?.label}` });
      if (detailOrder?.id === id && res.data) {
        setDetailOrder(res.data);
      }
      fetchOrders();
      return;
    }
    addToast({ type: "error", title: "Lỗi cập nhật", message: res.error || "Không thể cập nhật trạng thái." });
  };

  const detailMeta = statusMeta[detailOrder?.status] || statusMeta.PENDING;
  const detailItems = Array.isArray(detailOrder?.items) ? detailOrder.items : [];
  const detailTotal = getOrderTotal(detailOrder);
  const detailQuantity = getOrderQuantity(detailOrder);
  const detailFacts = [
    { label: "Loại đơn", value: typeLabels[detailOrder?.orderType] || "Khác" },
    { label: "Thanh toán", value: paymentLabels[detailOrder?.paymentMethod] || "Chưa chọn" },
    { label: "Số lượng", value: `${detailQuantity || 0} món` },
    {
      label: detailOrder?.orderType === "DINE_IN" ? "Giờ đến" : "Tạo lúc",
      value: formatDateTime(detailOrder?.orderType === "DINE_IN" ? detailOrder?.reservationTime : detailOrder?.createdAt)
    }
  ];

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
            const total = getOrderTotal(order);
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
                      {typeLabels[order.orderType] || "Khác"} · {paymentLabels[order.paymentMethod] || "Chưa chọn"}
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
                    <p>Tổng: {formatPriceVnd(total || 0)}</p>
                    {order.orderType === "DELIVERY" ? (
                      <>
                        <p>Người nhận: {order.receiverName || "-"}</p>
                        <p>Địa chỉ: {order.deliveryAddress || "-"}</p>
                      </>
                    ) : (
                      <>
                        <p>Bàn: {order.tableNumber || "-"}</p>
                        <p>Thời gian đến: {formatDateTime(order.reservationTime)}</p>
                      </>
                    )}
                  </div>
                  <div>
                    <p>Số lượng: {quantityTotal || "-"}</p>
                    <p>SĐT: {order.receiverPhone || "-"}</p>
                  </div>
                </div>
                <div className="admin-order-actions">
                  <button className="admin-action" type="button" onClick={() => openDetail(order)}>
                    Xem chi tiết
                  </button>
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

      <Modal
        open={detailOpen}
        title={detailOrder ? `Đơn #${detailOrder.id}` : "Chi tiết đơn hàng"}
        onClose={closeDetail}
        cardClassName="admin-detail-modal"
        headClassName="admin-detail-modal-head"
        titleClassName="admin-detail-modal-title"
        bodyClassName="admin-detail-modal-body"
        footerClassName="admin-detail-modal-footer"
        footer={
          <button className="admin-button ghost" type="button" onClick={closeDetail}>
            Đóng
          </button>
        }
      >
        {detailLoading ? (
          <div className="admin-detail-loading">
            <LoadingOverlay label="Đang tải chi tiết đơn..." className="admin-loader" />
          </div>
        ) : detailOrder ? (
          <div className="admin-detail-shell">
            {detailError ? <p className="text-sm text-rose-600">{detailError}</p> : null}

            <section className="admin-detail-hero">
              <div className="admin-detail-hero-copy">
                <p className="admin-detail-eyebrow">Bản ghi phục vụ #{detailOrder.id}</p>
                <div className="admin-detail-status-row">
                  <span className={`admin-order-status ${detailMeta.tone}`}>{detailMeta.label}</span>
                  <span className="admin-detail-inline-meta">{typeLabels[detailOrder.orderType] || "Khác"}</span>
                  <span className="admin-detail-dot" aria-hidden="true" />
                  <span className="admin-detail-inline-meta">{paymentLabels[detailOrder.paymentMethod] || "Chưa chọn"}</span>
                </div>
                <p className="admin-detail-note">{detailMeta.note}</p>
              </div>

              <div className="admin-detail-total-card">
                <span className="admin-detail-total-label">Tổng thanh toán</span>
                <strong className="admin-detail-total-amount">{formatPriceVnd(detailTotal)}</strong>
                <p className="admin-detail-total-meta">
                  {detailQuantity || 0} món · Cập nhật {formatDateTime(detailOrder.updatedAt || detailOrder.createdAt)}
                </p>
              </div>
            </section>

            <section className="admin-detail-facts">
              {detailFacts.map((fact) => (
                <article key={fact.label} className="admin-detail-fact">
                  <p className="admin-detail-fact-label">{fact.label}</p>
                  <p className="admin-detail-fact-value">{fact.value}</p>
                </article>
              ))}
            </section>

            <div className="admin-detail-grid">
              <section className="admin-detail-panel admin-detail-panel-main">
                <div className="admin-detail-panel-head">
                  <div>
                    <p className="admin-detail-panel-eyebrow">Danh sách món</p>
                    <h4 className="font-display text-2xl text-ink">Món trong đơn</h4>
                  </div>
                  <span className="admin-detail-panel-meta">{detailItems.length} món</span>
                </div>
                <p className="admin-detail-panel-copy">Kiểm tra món, số lượng và thành tiền theo từng phần.</p>

                <div className="admin-detail-item-list">
                  {detailItems.length === 0 ? (
                    <div className="admin-detail-empty">Đơn hàng hiện chưa có danh sách món chi tiết.</div>
                  ) : (
                    detailItems.map((item) => (
                      <article key={item.id || `${detailOrder.id}-${item.product}`} className="admin-detail-item">
                        <div className="admin-detail-item-main">
                          <div>
                            <p className="admin-detail-item-title">{formatText(item.product, "Món đang cập nhật")}</p>
                            <div className="admin-detail-item-meta">
                              <span className="admin-detail-item-badge">{item.quantity || 0} x</span>
                              <span>{formatPriceVnd(item.price || 0)}</span>
                            </div>
                          </div>
                          <p className="admin-detail-item-total">{formatPriceVnd(getItemSubtotal(item))}</p>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>

              <aside className="admin-detail-sidebar">
                <section className="admin-detail-panel">
                  <div className="admin-detail-panel-head compact">
                    <div>
                      <p className="admin-detail-panel-eyebrow">Liên hệ</p>
                      <h4 className="font-display text-xl text-ink">Thông tin nhận món</h4>
                    </div>
                  </div>
                  <div className="admin-detail-field-list">
                    <div className="admin-detail-field">
                      <span className="admin-detail-field-label">Người nhận</span>
                      <span className="admin-detail-field-value">{formatText(detailOrder.receiverName)}</span>
                    </div>
                    <div className="admin-detail-field">
                      <span className="admin-detail-field-label">Số điện thoại</span>
                      <span className="admin-detail-field-value">{formatText(detailOrder.receiverPhone)}</span>
                    </div>
                    <div className="admin-detail-field">
                      <span className="admin-detail-field-label">Địa chỉ</span>
                      <span className="admin-detail-field-value">{formatText(detailOrder.deliveryAddress)}</span>
                    </div>
                    <div className="admin-detail-field split">
                      <div>
                        <span className="admin-detail-field-label">Bàn</span>
                        <span className="admin-detail-field-value">{formatText(detailOrder.tableNumber)}</span>
                      </div>
                      <div>
                        <span className="admin-detail-field-label">Giờ đến</span>
                        <span className="admin-detail-field-value">{formatDateTime(detailOrder.reservationTime)}</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="admin-detail-panel">
                  <div className="admin-detail-panel-head compact">
                    <div>
                      <p className="admin-detail-panel-eyebrow">Dòng thời gian</p>
                      <h4 className="font-display text-xl text-ink">Mốc thời gian</h4>
                    </div>
                  </div>
                  <div className="admin-detail-field-list">
                    <div className="admin-detail-field">
                      <span className="admin-detail-field-label">Tạo lúc</span>
                      <span className="admin-detail-field-value">{formatDateTime(detailOrder.createdAt)}</span>
                    </div>
                    <div className="admin-detail-field">
                      <span className="admin-detail-field-label">Cập nhật lúc</span>
                      <span className="admin-detail-field-value">{formatDateTime(detailOrder.updatedAt)}</span>
                    </div>
                  </div>
                </section>

                <section className="admin-detail-panel admin-detail-panel-muted">
                  <div className="admin-detail-panel-head compact">
                    <div>
                      <p className="admin-detail-panel-eyebrow">Ghi chú thêm</p>
                      <h4 className="font-display text-xl text-ink">Lời nhắn cho bếp</h4>
                    </div>
                  </div>
                  <p className="admin-detail-note-copy">
                    {formatText(detailOrder.description, "Đơn hàng này không có ghi chú thêm.")}
                  </p>
                </section>
              </aside>
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink/60">Chưa có dữ liệu đơn hàng để hiển thị.</p>
        )}
      </Modal>
    </div>
  );
}

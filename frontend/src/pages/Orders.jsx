import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../lib/api.js";
import { clearToken, getProfileFromToken, isSessionInvalidResponse, SESSION_EXPIRED_MESSAGE } from "../lib/auth.js";
import { useToast } from "../context/ToastContext.jsx";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

const statusMeta = {
  PENDING: {
    label: "Chờ xác nhận",
    note: "Đơn đã tạo thành công. Quán sẽ xác nhận sớm.",
    tone: "bg-amber-100 text-amber-800"
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    note: "Đơn đã được xác nhận, đang chuẩn bị món.",
    tone: "bg-sky-100 text-sky-800"
  },
  PAID: {
    label: "Thanh toán thành công",
    note: "Thanh toán đã hoàn tất. Quán đang xử lý đơn.",
    tone: "bg-emerald-100 text-emerald-800"
  },
  COMPLETED: {
    label: "Hoàn tất",
    note: "Đơn đã hoàn tất. Cảm ơn bạn đã ủng hộ.",
    tone: "bg-emerald-100 text-emerald-800"
  },
  CANCELLED: {
    label: "Đã hủy",
    note: "Đơn đã bị hủy. Liên hệ quán nếu cần hỗ trợ.",
    tone: "bg-rose-100 text-rose-700"
  }
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

export default function Orders() {
  const profile = useMemo(() => getProfileFromToken(), []);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const previousStatus = useRef({});
  const initialized = useRef(false);

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      setError("Vui lòng đăng nhập để xem đơn hàng.");
      return;
    }

    let active = true;
    let intervalId;

    const fetchOrders = async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }
      const res = await getOrders();
      if (!active) return;
      if (res.status >= 200 && res.status < 300) {
        const payload = res.data?.data;
        const data = Array.isArray(payload) ? payload : payload?.content || [];
        if (initialized.current) {
          data.forEach((order) => {
            const prev = previousStatus.current[order.id];
            if (prev && prev !== order.status) {
              const meta = statusMeta[order.status] || statusMeta.PENDING;
              addToast({
                type: "success",
                title: `Đơn #${order.id}`,
                message: `Trạng thái mới: ${meta.label}`
              });
            }
            previousStatus.current[order.id] = order.status;
          });
        } else {
          data.forEach((order) => {
            previousStatus.current[order.id] = order.status;
          });
          initialized.current = true;
        }
        setOrders(data);
        setError("");
      } else {
        if (isSessionInvalidResponse(res)) {
          clearToken();
          setOrders([]);
          setError(SESSION_EXPIRED_MESSAGE);
          addToast({
            type: "warning",
            title: "Phiên đăng nhập hết hiệu lực",
            message: SESSION_EXPIRED_MESSAGE
          });
          navigate("/login", { replace: true, state: { message: SESSION_EXPIRED_MESSAGE } });
          return;
        }
        setOrders([]);
        setError(res.data?.message || "Không thể tải đơn hàng.");
      }
      setLoading(false);
    };

    fetchOrders();
    intervalId = window.setInterval(() => fetchOrders(true), 15000);

    return () => {
      active = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [profile, addToast, navigate]);

  return (
    <div className="slide-deck">
      <section
        className="slide slide-hero ml-page-hero"
        style={{
          backgroundImage:
            "url(/images/z7699818644305_2d4593c168855b379e693ea8a463137d.jpg)"
        }}
      >
        <div className="ml-page-hero-content">
          <p className="ml-breadcrumb">Trang chủ / Đơn hàng</p>
          <h2 className="font-display ml-hero-title">Đơn hàng</h2>
          <p className="ml-hero-subtitle">Theo dõi tiến trình các đơn hàng gần đây.</p>
        </div>
      </section>

      <div className="slide ml-section">
        <p className="ml-label">Lịch sử</p>
        <h3 className="mt-3 font-display text-2xl">Hoạt động gần đây</h3>
        {loading && <LoadingOverlay label="Đang kiểm tra đơn hàng của bạn..." className="mt-4" />}
        {!loading && error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="mt-2 text-sm text-ink/70">Chưa có đơn nào được ghi nhận.</p>
        )}
        {!loading && !error && orders.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {orders.map((order) => {
              const meta = statusMeta[order.status] || statusMeta.PENDING;
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
                <div key={order.id} className="ml-card">
                  <div className="flex items-start justify-between gap-3">
                    <strong className="block text-base">Đơn #{order.id}</strong>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.tone}`}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink/70">{meta.note}</p>
                  <div className="mt-3 text-sm text-ink/60">
                    <p>
                      Món: {productLabel || "-"}
                      {extraCount > 0 ? ` +${extraCount}` : ""}
                    </p>
                    <p>Loại: {typeLabels[order.orderType] || "Khác"}</p>
                    <p>Thanh toán: {paymentLabels[order.paymentMethod] || "Chưa chọn"}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-ink/70">
                    <span>Số lượng: {quantityTotal || "-"}</span>
                    <span className="font-semibold">
                      ${Number(total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

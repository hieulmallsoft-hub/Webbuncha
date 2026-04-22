import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrderById, getOrders } from "../lib/api.js";
import {
  clearToken,
  getProfileFromToken,
  isSessionInvalidResponse,
  SESSION_EXPIRED_MESSAGE
} from "../lib/auth.js";
import { useToast } from "../context/ToastContext.jsx";
import { formatPriceVND } from "../utils/price.js";

const statusMeta = {
  PENDING: {
    label: "Chờ xác nhận",
    note: "Món đang được đầu bếp tiếp nhận.",
    tone: "bg-amber-100 text-amber-800 border-amber-200"
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    note: "Bếp đã đỏ lửa, món đang được chuẩn bị.",
    tone: "bg-sky-100 text-sky-800 border-sky-200"
  },
  PAID: {
    label: "Đã thanh toán",
    note: "Nhà hàng đã nhận được giao dịch thanh toán thành công.",
    tone: "bg-emerald-100 text-emerald-800 border-emerald-200"
  },
  COMPLETED: {
    label: "Hoàn tất",
    note: "Cảm ơn quý khách đã dùng bữa tại Chinh Hương.",
    tone: "bg-[#6A7B53]/10 text-[#6A7B53] border-[#6A7B53]/20"
  },
  CANCELLED: {
    label: "Đã hủy",
    note: "Đơn hàng đã được thu hồi.",
    tone: "bg-rose-100 text-rose-700 border-rose-200"
  }
};

const typeLabels = {
  DELIVERY: "Giao tận nơi",
  DINE_IN: "Dùng tại bàn"
};

const paymentLabels = {
  COD: "Khi nhận món",
  BANK_TRANSFER: "Chuyển khoản",
  CARD: "Thẻ ngân hàng",
  MOMO: "Ví điện tử",
  VNPAY: "VNPay"
};

const formatOrderDate = (value) => {
  if (!value) {
    return "Chưa cập nhật";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsed);
};

const formatText = (value, fallback = "Chưa cập nhật") => {
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

  return (order?.items || []).reduce((sum, item) => sum + getItemSubtotal(item), 0);
};

export default function Orders() {
  const profile = useMemo(() => getProfileFromToken(), []);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const previousStatus = useRef({});
  const initialized = useRef(false);

  const handleSessionExpired = () => {
    clearToken();
    navigate("/login", { replace: true, state: { message: SESSION_EXPIRED_MESSAGE } });
  };

  const closeDetail = () => {
    setSelectedOrderId(null);
    setSelectedOrder(null);
    setDetailError("");
    setDetailLoading(false);
  };

  const openOrderDetail = async (order) => {
    setSelectedOrderId(order.id);
    setSelectedOrder(order);
    setDetailLoading(true);
    setDetailError("");

    const res = await getOrderById(order.id);
    if (isSessionInvalidResponse(res)) {
      closeDetail();
      handleSessionExpired();
      return;
    }

    if (res.status >= 200 && res.status < 300) {
      setSelectedOrder(res.data?.data || order);
      setDetailLoading(false);
      return;
    }

    const message = res.data?.message || `Không thể tải chi tiết đơn #${order.id}.`;
    setDetailError(message);
    setDetailLoading(false);
    addToast({
      type: "error",
      title: `Đơn #${order.id}`,
      message
    });
  };

  useEffect(() => {
    if (!selectedOrderId) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeDetail();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedOrderId]);

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      setError("Vui lòng đăng nhập để xem lịch sử nếp ăn.");
      return undefined;
    }

    let active = true;
    let intervalId;

    const fetchOrders = async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }

      const res = await getOrders();
      if (!active) {
        return;
      }

      if (res.status >= 200 && res.status < 300) {
        const payload = res.data?.data;
        const data = Array.isArray(payload) ? payload : payload?.content || [];

        if (initialized.current) {
          data.forEach((order) => {
            const previous = previousStatus.current[order.id];
            if (previous && previous !== order.status) {
              const meta = statusMeta[order.status] || statusMeta.PENDING;
              addToast({
                type: "success",
                title: `Đơn #${order.id}`,
                message: `Cập nhật: ${meta.label}`
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
        setLoading(false);
        return;
      }

      if (isSessionInvalidResponse(res)) {
        handleSessionExpired();
        return;
      }

      setError(res.data?.message || "Không thể tải danh sách đơn.");
      setLoading(false);
    };

    fetchOrders();
    intervalId = window.setInterval(() => fetchOrders(true), 20000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [profile, addToast, navigate]);

  const detailItems = selectedOrder?.items || [];
  const selectedMeta = statusMeta[selectedOrder?.status] || statusMeta.PENDING;

  return (
    <div className="bg-[#FDFBF7] min-h-screen text-[#1A1A1A] font-sans pb-24 md:pb-32 overflow-hidden">
      <section className="relative h-[35vh] md:h-[45vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.7] sepia-[0.1]"
          style={{ backgroundImage: "url(/images/z7699818644305_2d4593c168855b379e693ea8a463137d.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#FDFBF7]" />

        <div className="relative z-10 text-center px-4 mt-12 animate-fade-up">
          <span className="text-[10px] uppercase tracking-[0.5em] text-white/90 font-bold mb-4 block drop-shadow-md">
            Nhật Ký Thưởng Thức
          </span>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-bold tracking-widest uppercase drop-shadow-2xl">
            Đơn Hàng
          </h2>
          <div className="w-16 h-1 bg-[#6A7B53] mx-auto rounded-full mt-4" />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12 md:mt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-[#F0EBE1] pb-10">
          <div>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#6A7B53] font-extrabold mb-2">
              Hoạt động gần đây
            </p>
            <h3 className="font-display text-3xl md:text-4xl font-bold">Lịch sử đặt món</h3>
          </div>
          {!loading && orders.length > 0 && (
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/40">
              Đang hiển thị {orders.length} đơn hàng
            </p>
          )}
        </div>

        {loading && (
          <div className="py-20 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-[#6A7B53] border-t-transparent rounded-full animate-spin mb-6" />
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#6A7B53]">
              Đang lật giở sổ sách...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center">
            <p className="text-red-500 font-bold uppercase tracking-widest text-xs">{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="bg-white border border-[#F0EBE1] p-16 rounded-3xl text-center shadow-sm">
            <span className="text-4xl mb-4 block">🎋</span>
            <p className="text-[#1A1A1A]/50 font-bold uppercase tracking-widest text-xs mb-8">
              Bạn chưa có đơn hàng nào được ghi nhận.
            </p>
            <button
              onClick={() => navigate("/menu")}
              className="px-10 py-4 bg-[#6A7B53] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#1C2B1C] transition-all"
            >
              Khám phá menu
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
            {orders.map((order) => {
              const meta = statusMeta[order.status] || statusMeta.PENDING;
              const isActive = selectedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white border border-[#F0EBE1] p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all hover:border-[#6A7B53]/20 group"
                >
                  <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-[#F0EBE1]/50">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/40">
                        Mã định danh đơn
                      </p>
                      <h4 className="font-display text-2xl font-bold text-[#1A1A1A]">Đơn #{order.id}</h4>
                    </div>
                    <div
                      className={`px-4 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${meta.tone} shadow-sm`}
                    >
                      {meta.label}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-[#F0EBE1]">
                      <p className="text-[9px] uppercase tracking-widest font-extrabold text-[#1A1A1A]/40 mb-3 ml-1">
                        Chi tiết phục vụ
                      </p>
                      <div className="space-y-2 text-sm font-bold text-[#1A1A1A]/80">
                        <p className="flex justify-between gap-4">
                          <span>Hình thức:</span>
                          <span className="text-[#6A7B53] text-right">{typeLabels[order.orderType] || "Khác"}</span>
                        </p>
                        <p className="flex justify-between gap-4">
                          <span>Thanh toán:</span>
                          <span className="text-right">{paymentLabels[order.paymentMethod] || "Chưa chọn"}</span>
                        </p>
                        <p className="flex justify-between gap-4">
                          <span>Cập nhật lúc:</span>
                          <span className="text-right font-normal">{formatOrderDate(order.updatedAt || order.createdAt)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-end justify-between gap-4 px-2">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-extrabold text-[#1A1A1A]/40">Thành tiền</p>
                        <p className="text-3xl font-display font-bold text-[#B8860B] mt-1">
                          {formatPriceVND(getOrderTotal(order))}
                        </p>
                      </div>
                      <button
                        className={`border text-[9px] uppercase tracking-widest font-bold px-5 py-2.5 rounded-xl transition-all ${
                          isActive
                            ? "bg-[#6A7B53] text-white border-[#6A7B53]"
                            : "bg-[#FAFAFA] border-[#F0EBE1] hover:bg-[#6A7B53] hover:text-white hover:border-[#6A7B53]"
                        }`}
                        onClick={() => openOrderDetail(order)}
                      >
                        Xem chi tiết đơn
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedOrderId && (
        <div
          className="fixed inset-0 z-50 bg-[#1A1A1A]/55 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
          onClick={closeDetail}
        >
          <div
            className="w-full md:max-w-4xl max-h-[92vh] overflow-hidden rounded-t-[2rem] md:rounded-[2rem] bg-[#FDFBF7] shadow-[0_30px_90px_rgba(28,43,28,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-6 md:px-8 py-5 border-b border-[#EDE5D9] bg-white/70 backdrop-blur">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#6A7B53] font-extrabold mb-2">Hồ sơ đơn hàng</p>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-[#1A1A1A]">Đơn #{selectedOrderId}</h3>
                <p className="text-sm text-[#1A1A1A]/55 mt-2">
                  Tạo lúc {formatOrderDate(selectedOrder?.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${selectedMeta.tone}`}>
                  {selectedMeta.label}
                </div>
                <button
                  type="button"
                  onClick={closeDetail}
                  className="w-11 h-11 rounded-full border border-[#E6DDCF] text-[#1A1A1A]/70 hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-all"
                  aria-label="Đóng chi tiết đơn hàng"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(92vh-88px)] px-6 md:px-8 py-6 md:py-8">
              {detailLoading && (
                <div className="mb-5 inline-flex items-center gap-3 rounded-2xl border border-[#E8E0D2] bg-white px-4 py-3 text-sm text-[#6A7B53] font-bold">
                  <span className="w-4 h-4 border-2 border-[#6A7B53] border-t-transparent rounded-full animate-spin" />
                  Đang tải chi tiết đơn hàng...
                </div>
              )}

              {detailError && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 font-semibold">
                  {detailError}
                </div>
              )}

              {selectedOrder && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-3xl border border-[#EDE5D9] bg-white p-5">
                      <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#1A1A1A]/35">Tổng thanh toán</p>
                      <p className="mt-3 text-3xl font-display font-bold text-[#B8860B]">
                        {formatPriceVND(getOrderTotal(selectedOrder))}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-[#EDE5D9] bg-white p-5">
                      <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#1A1A1A]/35">Loại đơn</p>
                      <p className="mt-3 text-lg font-bold text-[#1A1A1A]">
                        {typeLabels[selectedOrder.orderType] || "Khác"}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-[#EDE5D9] bg-white p-5">
                      <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#1A1A1A]/35">Thanh toán</p>
                      <p className="mt-3 text-lg font-bold text-[#1A1A1A]">
                        {paymentLabels[selectedOrder.paymentMethod] || "Chưa chọn"}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-[#EDE5D9] bg-white p-5">
                      <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#1A1A1A]/35">Cập nhật cuối</p>
                      <p className="mt-3 text-lg font-bold text-[#1A1A1A]">
                        {formatOrderDate(selectedOrder.updatedAt || selectedOrder.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <section className="rounded-[2rem] border border-[#EDE5D9] bg-white p-6 md:p-7">
                      <div className="flex items-center justify-between gap-4 mb-5">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.35em] text-[#6A7B53] font-extrabold mb-2">Danh sách món</p>
                          <h4 className="font-display text-2xl font-bold text-[#1A1A1A]">Món trong đơn</h4>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/35">
                          {detailItems.length} món
                        </span>
                      </div>

                      <div className="space-y-4">
                        {detailItems.length === 0 && (
                          <div className="rounded-2xl border border-dashed border-[#E0D7C9] px-4 py-5 text-sm text-[#1A1A1A]/55">
                            Đơn hàng hiện chưa có chi tiết món nào.
                          </div>
                        )}

                        {detailItems.map((item) => (
                          <article
                            key={item.id || `${selectedOrder.id}-${item.product}`}
                            className="rounded-3xl border border-[#F0EBE1] bg-[#FCFBF8] p-5"
                          >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                              <div>
                                <p className="text-lg font-bold text-[#1A1A1A]">{formatText(item.product, "Món đang cập nhật")}</p>
                                <p className="text-sm text-[#1A1A1A]/55 mt-1">
                                  {item.quantity || 0} x {formatPriceVND(item.price || 0)}
                                </p>
                              </div>
                              <p className="text-lg font-display font-bold text-[#B8860B]">
                                {formatPriceVND(getItemSubtotal(item))}
                              </p>
                            </div>
                            {item.description && (
                              <p className="mt-3 text-sm text-[#1A1A1A]/65 border-t border-[#EFE6D8] pt-3">
                                Ghi chú món: {item.description}
                              </p>
                            )}
                          </article>
                        ))}
                      </div>
                    </section>

                    <div className="space-y-6">
                      <section className="rounded-[2rem] border border-[#EDE5D9] bg-white p-6 md:p-7">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-[#6A7B53] font-extrabold mb-2">Thông tin nhận món</p>
                        <h4 className="font-display text-2xl font-bold text-[#1A1A1A] mb-5">Liên hệ và phục vụ</h4>
                        <div className="space-y-4 text-sm text-[#1A1A1A]/80">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#1A1A1A]/35 mb-1">Người nhận</p>
                            <p className="font-semibold">{formatText(selectedOrder.receiverName)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#1A1A1A]/35 mb-1">Số điện thoại</p>
                            <p className="font-semibold">{formatText(selectedOrder.receiverPhone)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#1A1A1A]/35 mb-1">Địa chỉ giao hàng</p>
                            <p className="font-semibold">{formatText(selectedOrder.deliveryAddress)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#1A1A1A]/35 mb-1">Số bàn</p>
                            <p className="font-semibold">{formatText(selectedOrder.tableNumber)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#1A1A1A]/35 mb-1">Thời gian hẹn</p>
                            <p className="font-semibold">{formatOrderDate(selectedOrder.reservationTime)}</p>
                          </div>
                        </div>
                      </section>

                      <section className="rounded-[2rem] border border-[#EDE5D9] bg-white p-6 md:p-7">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-[#6A7B53] font-extrabold mb-2">Ghi chú thêm</p>
                        <h4 className="font-display text-2xl font-bold text-[#1A1A1A] mb-4">Lời nhắn cho bếp</h4>
                        <p className="text-sm leading-7 text-[#1A1A1A]/75">
                          {formatText(selectedOrder.description, "Đơn hàng này không để lại ghi chú thêm.")}
                        </p>
                      </section>

                      <section className="rounded-[2rem] border border-[#EDE5D9] bg-[#FAF6EF] p-6 md:p-7">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-[#B8860B] font-extrabold mb-2">Ghi chú trạng thái</p>
                        <h4 className="font-display text-2xl font-bold text-[#1A1A1A] mb-4">Tình trạng đơn hiện tại</h4>
                        <p className="text-sm leading-7 text-[#1A1A1A]/75">{selectedMeta.note}</p>
                      </section>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

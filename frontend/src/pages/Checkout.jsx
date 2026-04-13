import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { createOrder } from "../lib/api.js";
import LocationMap from "../components/LocationMap.jsx";

const paymentOptions = [
  { value: "COD", label: "Thanh toán khi nhận món" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản" },
  { value: "CARD", label: "Thẻ ngân hàng" },
  { value: "MOMO", label: "Ví MoMo" }
];

export default function Checkout() {
  const { items, summary, clearCart } = useCart();
  const { addToast } = useToast();
  const [orderType, setOrderType] = useState("DINE_IN");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [status, setStatus] = useState("Sẵn sàng nhận món");
  const [form, setForm] = useState({
    receiverName: "",
    receiverPhone: "",
    deliveryAddress: "",
    tableNumber: "",
    reservationTime: "",
    note: ""
  });

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const orderLabel = useMemo(
    () => (orderType === "DELIVERY" ? "Giao hàng" : "Ăn tại quán"),
    [orderType]
  );

  const paymentLabel = useMemo(() => {
    const option = paymentOptions.find((item) => item.value === paymentMethod);
    return option ? option.label : "Thanh toán";
  }, [paymentMethod]);

  const statusTone = useMemo(() => {
    if (!status) {
      return "checkout-status";
    }
    const lowered = status.toLowerCase();
    if (lowered.includes("thành công")) {
      return "checkout-status success";
    }
    if (lowered.includes("thất bại") || lowered.includes("lỗi") || lowered.includes("cần")) {
      return "checkout-status error";
    }
    if (lowered.includes("đang")) {
      return "checkout-status pending";
    }
    return "checkout-status";
  }, [status]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (items.length === 0) {
      setStatus("Giỏ hàng đang trống, vui lòng chọn món trước.");
      addToast({
        type: "warning",
        title: "Gi\u1ecf h\u00e0ng tr\u1ed1ng",
        message: "Vui l\u00f2ng ch\u1ecdn m\u00f3n tr\u01b0\u1edbc khi \u0111\u1eb7t."
      });
      return;
    }
    if (orderType === "DELIVERY") {
      if (!form.receiverName || !form.receiverPhone || !form.deliveryAddress) {
        setStatus("Vui lòng nhập đầy đủ người nhận, số điện thoại và địa chỉ giao hàng.");
        addToast({
          type: "warning",
          title: "Thiếu thông tin",
          message: "Vui lòng nhập đủ người nhận, số điện thoại và địa chỉ giao hàng."
        });
        return;
      }
    }
    if (orderType === "DINE_IN") {
      if (!form.tableNumber && !form.reservationTime) {
        setStatus("Vui lòng nhập số bàn hoặc thời gian đến.");
        addToast({
          type: "warning",
          title: "Thiếu thông tin",
          message: "Vui lòng nhập số bàn hoặc thời gian đến."
        });
        return;
      }
    }
    setStatus("Đang gửi đơn hàng...");
    try {
      const payload = {
        items: items.map((item) => ({
          product: item.name,
          quantity: item.qty,
          price: item.price,
          description: item.description
        })),
        description: form.note || null,
        orderType,
        receiverName: orderType === "DELIVERY" ? form.receiverName : null,
        receiverPhone: orderType === "DELIVERY" ? form.receiverPhone : null,
        deliveryAddress: orderType === "DELIVERY" ? form.deliveryAddress : null,
        tableNumber: orderType === "DINE_IN" ? form.tableNumber || null : null,
        reservationTime: orderType === "DINE_IN" ? form.reservationTime || null : null,
        paymentMethod
      };

      const res = await createOrder(payload);
      if (res.status < 200 || res.status >= 300) {
        if (res.status === 401) {
          setStatus("Bạn cần đăng nhập để đặt món.");
          addToast({
            type: "error",
            title: "Chưa đăng nhập",
            message: "Vui lòng đăng nhập để đặt món."
          });
          return;
        }
        setStatus(res.data?.message || "Đặt món thất bại, vui lòng thử lại.");
        addToast({
          type: "error",
          title: "Đặt món thất bại",
          message: res.data?.message || "Vui lòng thử lại."
        });
        return;
      }


      const message =
        orderType === "DELIVERY"
          ? "Đặt món giao hàng thành công. Quán sẽ xác nhận trong 8 phút."
          : "Đặt món tại quán thành công. Quán sẽ xác nhận trong 8 phút.";
      setStatus(message);
      addToast({
        type: "success",
        title: "\u0110\u1eb7t m\u00f3n th\u00e0nh c\u00f4ng",
        message
      });
      clearCart();
    } catch (error) {
      setStatus("Đặt món thất bại, vui lòng thử lại.");
      addToast({
        type: "error",
        title: "Đặt món thất bại",
        message: "Đã xảy ra lỗi, vui lòng thử lại."
      });
    }
  };

  return (
    <div className="slide-deck">
      <section
        className="slide slide-hero ml-page-hero"
        style={{
          backgroundImage:
            "url(/images/z7699819261474_677c51c196472064844735caaeffa251.jpg)"
        }}
      >
        <div className="ml-page-hero-content">
          <p className="ml-breadcrumb">Trang chủ / Đặt món</p>
          <h2 className="font-display ml-hero-title">Đặt món</h2>
          <p className="ml-hero-subtitle">Chọn hình thức nhận món và hoàn tất thông tin.</p>
        </div>
      </section>

      <div className="slide grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="ml-section checkout-panel">
          <p className="ml-label">Thông tin</p>
          <h3 className="mt-3 font-display text-2xl">Chi tiết đơn hàng</h3>
          <form className="mt-6 space-y-6 checkout-form" onSubmit={handleSubmit}>
            <div>
              <p className="ml-label">Hình thức nhận món</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { value: "DINE_IN", label: "Ăn tại quán" },
                  { value: "DELIVERY", label: "Giao hàng" }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`checkout-pill ${
                      orderType === option.value
                        ? "is-active"
                        : ""
                    }`}
                    onClick={() => setOrderType(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {orderType === "DELIVERY" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="ml-label" htmlFor="receiverName">
                    Người nhận
                  </label>
                  <input
                    className="ml-input checkout-input"
                    id="receiverName"
                    placeholder="Nguyễn Minh Anh"
                    value={form.receiverName}
                    onChange={handleChange("receiverName")}
                    required
                  />
                </div>
                <div>
                  <label className="ml-label" htmlFor="receiverPhone">
                    Số điện thoại
                  </label>
                  <input
                    className="ml-input checkout-input"
                    id="receiverPhone"
                    placeholder="+84 912 000 000"
                    value={form.receiverPhone}
                    onChange={handleChange("receiverPhone")}
                    required
                  />
                </div>
                <div>
                  <label className="ml-label" htmlFor="deliveryAddress">
                    Địa chỉ giao hàng
                  </label>
                  <input
                    className="ml-input checkout-input"
                    id="deliveryAddress"
                    placeholder="Số 8 Trần Phú, Bỉm Sơn"
                    value={form.deliveryAddress}
                    onChange={handleChange("deliveryAddress")}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="ml-label" htmlFor="tableNumber">
                    Số bàn
                  </label>
                  <input
                    className="ml-input checkout-input"
                    id="tableNumber"
                    placeholder="Bàn 08"
                    value={form.tableNumber}
                    onChange={handleChange("tableNumber")}
                  />
                </div>
                <div>
                  <label className="ml-label" htmlFor="reservationTime">
                    Thời gian đến (tùy chọn)
                  </label>
                  <input
                    className="ml-input checkout-input"
                    id="reservationTime"
                    type="datetime-local"
                    value={form.reservationTime}
                    onChange={handleChange("reservationTime")}
                  />
                </div>
              </div>
            )}

            <LocationMap />

            <div>
              <label className="ml-label" htmlFor="note">
                Ghi chú
              </label>
              <input
                className="ml-input checkout-input"
                id="note"
                placeholder="Không hành, thêm ớt."
                value={form.note}
                onChange={handleChange("note")}
              />
            </div>

            <div>
              <label className="ml-label" htmlFor="paymentMethod">
                Phương thức thanh toán
              </label>
              <select
                className="ml-input checkout-input"
                id="paymentMethod"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                {paymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="ml-button checkout-primary" type="submit" disabled={items.length === 0}>
                Xác nhận đặt món
              </button>
              <Link className="ml-button-outline checkout-secondary" to="/menu">
                Chọn thêm món
              </Link>
            </div>
          </form>
          <p className={`mt-4 text-sm ${statusTone}`}>{status}</p>
        </section>

        <aside className="ml-dark checkout-summary">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Tổng kết</p>
          <h4 className="mt-3 font-display text-xl">Đơn hàng của bạn</h4>
          <div className="mt-4 space-y-3 text-sm text-cream/80">
            {items.length === 0 ? (
              <p>Chưa có món nào trong giỏ.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span>
                    {item.name} x{item.qty}
                  </span>
                  <span>${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 space-y-2 text-sm text-cream/80">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>${summary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{orderType === "DELIVERY" ? "Phí giao hàng" : "Phí dịch vụ"}</span>
              <span>${summary.fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-cream">
              <span>Tổng</span>
              <span>${summary.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-cream/80">
            <p>
              <strong className="text-cream">Hình thức:</strong> {orderLabel}
            </p>
            <p className="mt-2">
              <strong className="text-cream">Thanh toán:</strong> {paymentLabel}
            </p>
            <p className="mt-2">
              <strong className="text-cream">Thời gian dự kiến:</strong>{" "}
              {orderType === "DELIVERY" ? "25 - 35 phút" : "12 - 18 phút"}
            </p>
          </div>
          <div className="mt-6 media-frame media-frame-dark">
            <span className="media-badge">Không gian</span>
            <img
              src="/images/z7699827552354_755b5c69c8b1297ef9a1201caf3b50cc.jpg"
              alt="Không gian quán bún chả"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

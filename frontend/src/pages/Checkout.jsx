import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { createOrder } from "../lib/api.js";
import { clearToken, isSessionInvalidResponse, SESSION_EXPIRED_MESSAGE } from "../lib/auth.js";
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
  const navigate = useNavigate();
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
        if (isSessionInvalidResponse(res)) {
          clearToken();
          setStatus(SESSION_EXPIRED_MESSAGE);
          addToast({
            type: "warning",
            title: "Phiên đăng nhập hết hiệu lực",
            message: SESSION_EXPIRED_MESSAGE
          });
          navigate("/login", { replace: true, state: { message: SESSION_EXPIRED_MESSAGE } });
          return;
        }
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
        title: "Đặt món thành công",
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
    <div className="bg-[#FDFBF7] min-h-screen text-[#1A1A1A] font-sans overflow-x-hidden">
      <style>
        {`
          .slide-in-bottom {
            animation: slideUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            opacity: 0;
            transform: translateY(40px);
          }
          .delay-200 { animation-delay: 200ms; }
          .delay-400 { animation-delay: 400ms; }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .light-glass-panel {
            background: #FFFFFF;
            border: 1px solid rgba(0,0,0,0.03);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
            border-radius: 20px;
          }
          .custom-input {
            width: 100%;
            background: transparent;
            border: none;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            padding: 12px 0 8px;
            font-size: 1rem;
            color: #1A1A1A;
            transition: all 0.3s ease;
          }
          .custom-input:focus {
            outline: none;
            border-bottom-color: #B8860B;
          }
          .custom-input::placeholder {
            color: rgba(0, 0, 0, 0.3);
            font-size: 0.9rem;
          }
          .custom-select {
            appearance: none;
            background: transparent url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23B8860B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E") no-repeat right .1rem top 50%;
            background-size: .65rem auto;
            border-radius: 0px;
            cursor: pointer;
          }
           .custom-select option {
            color: #1A1A1A;
            background: #FFFFFF;
          }
          .pill-btn {
            transition: all 0.3s ease;
          }
          .pill-btn.active {
            background: #1A1A1A;
            color: #FFFFFF;
            border-color: #1A1A1A;
            font-weight: 600;
          }
          .pill-btn.inactive {
            background: transparent;
            color: rgba(0, 0, 0, 0.5);
            border-color: rgba(0, 0, 0, 0.15);
          }
          .pill-btn.inactive:hover {
            border-color: #B8860B;
            color: #1A1A1A;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.02);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(184, 134, 11, 0.2);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(184, 134, 11, 0.5);
          }
        `}
      </style>

      {/* Hero Section */}
      <section className="relative h-[35vh] md:h-[45vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105 filter brightness-[0.7] sepia-[0.1]"
          style={{ backgroundImage: "url(/images/z7699819261474_677c51c196472064844735caaeffa251.jpg)" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#FDFBF7]"></div>
        <div className="relative z-10 text-center px-4 mt-8 md:mt-16 slide-in-bottom">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[#D4AF37] font-bold mb-3 md:mb-4 drop-shadow-md">
            Trang chủ / Đặt món
          </p>
          <h2 className="font-display text-4xl md:text-6xl text-[#1A1A1A] mb-4 md:mb-6 tracking-wide [text-shadow:0_2px_15px_rgba(255,255,255,0.7)]">
            Thanh Toán
          </h2>
          <div className="mt-4 md:mt-8 w-12 md:w-16 h-[2px] bg-[#B8860B] mx-auto opacity-70"></div>
        </div>
      </section>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 grid lg:grid-cols-12 gap-8 md:gap-12 slide-in-bottom delay-200 relative z-10 md:-mt-20">
        
        {/* Left Side: Detail form */}
        <section className="lg:col-span-7 light-glass-panel p-6 md:p-10">
          <h3 className="font-display text-2xl md:text-3xl text-[#1A1A1A] mb-6 md:mb-8 border-b border-[#F0EBE1] pb-4">Chi tiết đơn hàng</h3>
          
          <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#8B7355] font-bold block mb-3 md:mb-4">Hình thức nhận món</label>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {[
                  { value: "DINE_IN", label: "Ăn tại quán" },
                  { value: "DELIVERY", label: "Giao hàng" }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`pill-btn px-4 md:px-6 py-2 rounded-full border text-[10px] md:text-xs uppercase tracking-wider ${
                      orderType === option.value ? "active shadow-[0_5px_15px_rgba(0,0,0,0.1)]" : "inactive"
                    }`}
                    onClick={() => setOrderType(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:gap-6 md:grid-cols-2 bg-[#FAFAFA] p-4 md:p-6 rounded-xl border border-[#F0EBE1]">
              {orderType === "DELIVERY" ? (
                <>
                  <div className="md:col-span-2">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-widest text-[#8B7355] font-semibold block mb-1">Người nhận</label>
                    <input
                      className="custom-input"
                      id="receiverName"
                      placeholder="Nguyễn Minh Anh"
                      value={form.receiverName}
                      onChange={handleChange("receiverName")}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-widest text-[#8B7355] font-semibold block mb-1">Số điện thoại</label>
                    <input
                      className="custom-input"
                      id="receiverPhone"
                      placeholder="+84 912 000 000"
                      value={form.receiverPhone}
                      onChange={handleChange("receiverPhone")}
                      required
                      type="tel"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-widest text-[#8B7355] font-semibold block mb-1">Địa chỉ giao hàng</label>
                    <input
                      className="custom-input"
                      id="deliveryAddress"
                      placeholder="Số 8 Trần Phú, Bỉm Sơn"
                      value={form.deliveryAddress}
                      onChange={handleChange("deliveryAddress")}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="md:col-span-2">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-widest text-[#8B7355] font-semibold block mb-1">Số bàn (Tùy chọn)</label>
                    <input
                      className="custom-input"
                      id="tableNumber"
                      placeholder="Ví dụ: Bàn 08"
                      value={form.tableNumber}
                      onChange={handleChange("tableNumber")}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-widest text-[#8B7355] font-semibold block mb-1">Thời gian đến (tùy chọn)</label>
                    <input
                      className="custom-input"
                      id="reservationTime"
                      type="datetime-local"
                      value={form.reservationTime}
                      onChange={handleChange("reservationTime")}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="rounded-xl overflow-hidden border border-[#F0EBE1] shadow-sm relative z-0">
               <LocationMap />
            </div>

            <div>
              <label className="text-[9px] md:text-[10px] uppercase tracking-widest text-[#8B7355] font-semibold block mb-1">Ghi chú yêu cầu thêm</label>
              <input
                className="custom-input"
                id="note"
                placeholder="Ví dụ: Không hành, thêm ớt..."
                value={form.note}
                onChange={handleChange("note")}
              />
            </div>

            <div>
              <label className="text-[9px] md:text-[10px] uppercase tracking-widest text-[#8B7355] font-semibold block mb-2">Phương thức thanh toán</label>
              <select
                className="custom-input custom-select text-[#1A1A1A] pb-3 font-medium"
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

            <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 border-t border-[#F0EBE1]">
              <button 
                className="flex-1 sm:flex-none px-6 md:px-8 py-3 md:py-4 bg-[#1A1A1A] text-white text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#D4AF37] transition-all duration-300 rounded-sm shadow-md" 
                type="submit" 
                disabled={items.length === 0}
              >
                Xác nhận đặt món
              </button>
              <Link 
                className="flex-1 sm:flex-none text-center px-6 md:px-8 py-3 md:py-4 bg-transparent border border-[#1A1A1A] text-[#1A1A1A] text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-[#1A1A1A] hover:text-white transition-colors duration-300 rounded-sm" 
                to="/menu"
              >
                Chọn thêm món
              </Link>
            </div>

            {status && (
              <p className={`mt-4 text-xs md:text-sm font-medium p-4 rounded-lg bg-white border shadow-sm ${statusTone.includes('error') ? 'border-red-200 text-red-600' : statusTone.includes('success') ? 'border-green-200 text-green-600' : 'border-[#D4AF37]/40 text-[#B8860B]'}`}>
                {status}
              </p>
            )}
          </form>
        </section>

        {/* Right Side: Summary */}
        <aside className="lg:col-span-5 relative">
          <div className="lg:sticky top-6 light-glass-panel p-6 md:p-8 overflow-hidden z-20">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-[50px] rounded-full pointer-events-none"></div>
             
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.35em] text-[#8B7355] font-semibold mb-2 md:mb-3">Tổng kết</p>
            <h4 className="font-display text-xl md:text-2xl text-[#1A1A1A] mb-4 md:mb-6">Đơn hàng của bạn</h4>
            
            <div className="space-y-4 max-h-[25vh] md:max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
              {items.length === 0 ? (
                <p className="text-[#1A1A1A]/50 text-xs md:text-sm italic">Chưa có món nào trong giỏ.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex flex-col border-b border-[#F0EBE1] pb-3">
                    <div className="flex justify-between items-start text-[#1A1A1A]">
                      <span className="font-medium pr-4 text-sm md:text-base">{item.name}</span>
                      <span className="text-[#B8860B] font-semibold whitespace-nowrap">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                    <span className="text-[#1A1A1A]/50 text-[10px] md:text-xs mt-1 uppercase tracking-wider">Số lượng: {item.qty}</span>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-6 md:mt-8 space-y-3 text-xs md:text-sm text-[#1A1A1A]/70 pt-4 border-t border-[#F0EBE1] pb-4 border-b">
              <div className="flex justify-between items-center">
                <span>Tạm tính</span>
                <span className="text-[#1A1A1A] font-medium">${summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>{orderType === "DELIVERY" ? "Phí giao hàng" : "Phí dịch vụ"}</span>
                <span className="text-[#1A1A1A] font-medium">${summary.fee.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-end">
               <span className="text-[10px] md:text-xs uppercase tracking-widest text-[#8B7355] font-semibold">Tổng thanh toán</span>
               <span className="text-2xl md:text-3xl font-display text-[#B8860B]">${summary.total.toFixed(2)}</span>
            </div>

            <div className="mt-6 md:mt-8 bg-[#FAFAFA] p-4 md:p-5 rounded-xl border border-[#F0EBE1] text-[10px] md:text-xs text-[#1A1A1A]/80 space-y-3 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]/50 transition-all duration-300 group-hover:bg-[#B8860B]"></div>
              <p className="pl-3">
                <strong className="text-[#1A1A1A] font-semibold tracking-wider uppercase text-[9px] md:text-[10px]">Hình thức:</strong> 
                <span className="ml-2 bg-[#1A1A1A]/5 px-2 py-1 rounded text-[#B8860B] font-medium">{orderLabel}</span>
              </p>
              <p className="pl-3">
                <strong className="text-[#1A1A1A] font-semibold tracking-wider uppercase text-[9px] md:text-[10px]">Thanh toán:</strong> 
                <span className="ml-2">{paymentLabel}</span>
              </p>
              <p className="pl-3">
                <strong className="text-[#1A1A1A] font-semibold tracking-wider uppercase text-[9px] md:text-[10px]">Dự kiến:</strong>{" "}
                <span className="ml-2">{orderType === "DELIVERY" ? "25 - 35 phút" : "12 - 18 phút"}</span>
              </p>
            </div>
            
            <div className="mt-6 md:mt-8 rounded-xl overflow-hidden relative group shadow-sm z-0">
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[8px] md:text-[9px] uppercase tracking-widest px-3 py-1 rounded border border-black/5 text-[#1A1A1A] font-bold z-10 shadow-sm">
                Không gian phòng
              </span>
              <img
                src="/images/z7699827552354_755b5c69c8b1297ef9a1201caf3b50cc.jpg"
                alt="Không gian quán"
                className="w-full h-24 md:h-32 object-cover transform transition-transform duration-700 group-hover:scale-110 filter brightness-[0.9] sepia-[0.1]"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

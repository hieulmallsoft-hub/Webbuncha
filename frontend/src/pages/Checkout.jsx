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
    <div className="bg-[#050505] min-h-screen text-gray-100 font-sans overflow-x-hidden">
      <style>
        {`
          .slide-in-bottom {
            animation: slideUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            opacity: 0;
            transform: translateY(40px);
          }
          .delay-200 {
            animation-delay: 200ms;
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .glass-panel {
            background: linear-gradient(145deg, rgba(20,20,20,0.9), rgba(10,10,10,0.95));
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
          }
          .custom-input {
            width: 100%;
            background: transparent;
            border: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.15);
            padding: 12px 0 8px;
            font-size: 1rem;
            color: #fff;
            transition: all 0.3s ease;
          }
          .custom-input:focus {
            outline: none;
            border-bottom-color: #d4af37;
          }
          .custom-input::placeholder {
            color: rgba(255, 255, 255, 0.2);
            font-size: 0.9rem;
          }
          .custom-select {
            appearance: none;
            background: rgba(20, 20, 20, 0.8) url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23d4af37%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E") no-repeat right .7rem top 50%;
            background-size: .65rem auto;
            border-radius: 4px;
            cursor: pointer;
          }
          .pill-btn {
            transition: all 0.3s ease;
          }
          .pill-btn.active {
            background: linear-gradient(135deg, #d4af37, #aa8c2c);
            color: #050505;
            border-color: #d4af37;
            font-weight: 700;
          }
          .pill-btn.inactive {
            background: transparent;
            color: rgba(255, 255, 255, 0.6);
            border-color: rgba(255, 255, 255, 0.2);
          }
          .pill-btn.inactive:hover {
            border-color: #d4af37;
            color: #fff;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(212, 175, 55, 0.3);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(212, 175, 55, 0.6);
          }
        `}
      </style>

      {/* Hero Section */}
      <section className="relative h-[45vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ backgroundImage: "url(/images/z7699819261474_677c51c196472064844735caaeffa251.jpg)" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#050505]"></div>
        <div className="relative z-10 text-center px-4 mt-16 slide-in-bottom">
          <p className="text-[10px] uppercase tracking-[0.5em] text-gold/80 font-bold mb-4 drop-shadow-md">
            Trang chủ / Đặt món
          </p>
          <h2 className="font-display text-5xl md:text-7xl text-white mb-6 tracking-wide drop-shadow-2xl">
            Thanh Toán
          </h2>
          <p className="text-white/60 text-sm md:text-base uppercase tracking-widest max-w-lg mx-auto">
            Hoàn tất thủ tục để chuẩn bị cho trải nghiệm mỹ vị của bạn.
          </p>
          <div className="mt-8 w-16 h-1 bg-gradient-to-r from-gold/20 via-gold to-gold/20 mx-auto"></div>
        </div>
      </section>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid lg:grid-cols-12 gap-12 slide-in-bottom delay-200 relative z-10 -mt-20">
        
        {/* Left Side: Detail form */}
        <section className="lg:col-span-7 glass-panel rounded-2xl p-8 md:p-10 border border-white/5">
          <h3 className="font-display text-3xl text-white mb-8 border-b border-white/10 pb-4">Chi tiết đơn hàng</h3>
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-gold/90 font-bold block mb-4">Hình thức nhận món</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: "DINE_IN", label: "Ăn tại quán" },
                  { value: "DELIVERY", label: "Giao hàng" }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`pill-btn px-6 py-2 rounded-full border text-xs uppercase tracking-wider ${
                      orderType === option.value ? "active shadow-[0_0_15px_rgba(212,175,55,0.4)]" : "inactive"
                    }`}
                    onClick={() => setOrderType(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 bg-white/[0.02] p-5 rounded-xl border border-white/5">
              {orderType === "DELIVERY" ? (
                <>
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/50 block mb-1">Người nhận</label>
                    <input
                      className="custom-input"
                      id="receiverName"
                      placeholder="Nguyễn Minh Anh"
                      value={form.receiverName}
                      onChange={handleChange("receiverName")}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/50 block mb-1">Số điện thoại</label>
                    <input
                      className="custom-input"
                      id="receiverPhone"
                      placeholder="+84 912 000 000"
                      value={form.receiverPhone}
                      onChange={handleChange("receiverPhone")}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/50 block mb-1">Địa chỉ giao hàng</label>
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
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/50 block mb-1">Số bàn (Tùy chọn)</label>
                    <input
                      className="custom-input"
                      id="tableNumber"
                      placeholder="Bàn 08"
                      value={form.tableNumber}
                      onChange={handleChange("tableNumber")}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/50 block mb-1">Thời gian đến (tùy chọn)</label>
                    <input
                      className="custom-input [color-scheme:dark]"
                      id="reservationTime"
                      type="datetime-local"
                      value={form.reservationTime}
                      onChange={handleChange("reservationTime")}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="rounded-xl overflow-hidden border border-white/10 opacity-90 hover:opacity-100 transition-opacity">
               <LocationMap />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/50 block mb-1">Ghi chú yêu cầu thêm</label>
              <input
                className="custom-input"
                id="note"
                placeholder="Ví dụ: Không hành, thêm ớt..."
                value={form.note}
                onChange={handleChange("note")}
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/50 block mb-2">Phương thức thanh toán</label>
              <select
                className="custom-input custom-select text-white/90 pb-3"
                id="paymentMethod"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                {paymentOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#1a1a1a] text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-4 border-t border-white/10">
              <button 
                className="px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] text-[#050505] text-xs uppercase tracking-[0.2em] font-extrabold hover:from-white hover:to-white transition-all duration-500 shadow-[0_10px_20px_rgba(212,175,55,0.2)] rounded-sm disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit" 
                disabled={items.length === 0}
              >
                Xác nhận đặt món
              </button>
              <Link 
                className="px-8 py-4 bg-transparent border border-white/20 text-white text-xs uppercase tracking-[0.2em] hover:border-gold hover:text-gold transition-colors duration-300 rounded-sm" 
                to="/menu"
              >
                Chọn thêm món
              </Link>
            </div>

            {status && (
              <p className={`mt-4 text-sm font-medium p-4 rounded-lg bg-white/5 border ${statusTone.includes('error') ? 'border-red-500/30 text-red-400' : statusTone.includes('success') ? 'border-green-500/30 text-green-400' : 'border-gold/30 text-gold'}`}>
                {status}
              </p>
            )}
          </form>
        </section>

        {/* Right Side: Summary */}
        <aside className="lg:col-span-5 relative">
          <div className="sticky top-24 glass-panel rounded-2xl p-8 border border-white/5 overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[50px] rounded-full pointer-events-none"></div>
             
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold font-semibold mb-3">Tổng kết</p>
            <h4 className="font-display text-2xl text-white mb-6">Đơn hàng của bạn</h4>
            
            <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
              {items.length === 0 ? (
                <p className="text-white/40 text-sm italic">Chưa có món nào trong giỏ.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex flex-col border-b border-white/5 pb-3">
                    <div className="flex justify-between items-start text-white/80">
                      <span className="font-medium pr-4">{item.name}</span>
                      <span className="text-gold whitespace-nowrap">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                    <span className="text-white/40 text-xs mt-1">Số lượng: {item.qty}</span>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-8 space-y-3 text-sm text-white/60 pt-4 border-t border-white/10 pb-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <span>Tạm tính</span>
                <span className="text-white">${summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>{orderType === "DELIVERY" ? "Phí giao hàng" : "Phí dịch vụ"}</span>
                <span className="text-white">${summary.fee.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-end">
               <span className="text-xs uppercase tracking-widest text-white/50">Tổng thanh toán</span>
               <span className="text-3xl font-display text-gold">${summary.total.toFixed(2)}</span>
            </div>

            <div className="mt-8 bg-[#1a1a1a]/80 p-5 rounded-xl border border-white/5 text-xs text-white/70 space-y-3 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold/50 transition-all duration-300 group-hover:bg-gold"></div>
              <p className="pl-2">
                <strong className="text-white/[0.85] font-semibold tracking-wide uppercase text-[10px]">Hình thức:</strong> 
                <span className="ml-2 bg-white/5 px-2 py-1 rounded text-gold">{orderLabel}</span>
              </p>
              <p className="pl-2">
                <strong className="text-white/[0.85] font-semibold tracking-wide uppercase text-[10px]">Thanh toán:</strong> 
                <span className="ml-2 text-white/80">{paymentLabel}</span>
              </p>
              <p className="pl-2">
                <strong className="text-white/[0.85] font-semibold tracking-wide uppercase text-[10px]">Dự kiến:</strong>{" "}
                <span className="ml-2 text-white/80">{orderType === "DELIVERY" ? "25 - 35 phút" : "12 - 18 phút"}</span>
              </p>
            </div>
            
            <div className="mt-8 rounded-xl overflow-hidden relative group">
              <span className="absolute top-3 left-3 bg-black/60 backdrop-blur text-[9px] uppercase tracking-widest px-3 py-1 rounded border border-white/10 text-white z-10">
                Không gian phòng
              </span>
              <img
                src="/images/z7699827552354_755b5c69c8b1297ef9a1201caf3b50cc.jpg"
                alt="Không gian quán"
                className="w-full h-32 object-cover transform transition-transform duration-700 group-hover:scale-110 filter brightness-75 sepia-[0.3]"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../lib/api.js";
import { clearToken, getProfileFromToken, isSessionInvalidResponse, SESSION_EXPIRED_MESSAGE } from "../lib/auth.js";
import { useToast } from "../context/ToastContext.jsx";
import LoadingOverlay from "../components/LoadingOverlay.jsx";
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
    note: "Gia đình đã nhận được chi phí. Cảm ơn quý khách.",
    tone: "bg-emerald-100 text-emerald-800 border-emerald-200"
  },
  COMPLETED: {
    label: "Hoàn tất",
    note: "Chúc quý khách ngon miệng và sớm quay lại.",
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
      setError("Vui lòng đăng nhập để xem lịch sử nếp ăn.");
      return;
    }

    let active = true;
    let intervalId;

    const fetchOrders = async (silent = false) => {
      if (!silent) setLoading(true);
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
                message: `Cập nhật: ${meta.label}`
              });
            }
            previousStatus.current[order.id] = order.status;
          });
        } else {
          data.forEach((order) => { previousStatus.current[order.id] = order.status; });
          initialized.current = true;
        }
        setOrders(data);
        setError("");
      } else {
        if (isSessionInvalidResponse(res)) {
          clearToken();
          navigate("/login", { replace: true, state: { message: SESSION_EXPIRED_MESSAGE } });
          return;
        }
        setError(res.data?.message || "Không thể tải danh sách đơn.");
      }
      setLoading(false);
    };

    fetchOrders();
    intervalId = window.setInterval(() => fetchOrders(true), 20000);
    return () => { active = false; window.clearInterval(intervalId); };
  }, [profile, addToast, navigate]);

  return (
    <div className="bg-[#FDFBF7] min-h-screen text-[#1A1A1A] font-sans pb-24 md:pb-32 overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[35vh] md:h-[45vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.7] sepia-[0.1]"
          style={{ backgroundImage: "url(/images/z7699818644305_2d4593c168855b379e693ea8a463137d.jpg)" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#FDFBF7]"></div>
        
        <div className="relative z-10 text-center px-4 mt-12 animate-fade-up">
           <span className="text-[10px] uppercase tracking-[0.5em] text-white/90 font-bold mb-4 block drop-shadow-md">Nhật Ký Thưởng Thức</span>
           <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-bold tracking-widest uppercase drop-shadow-2xl">Đơn Hàng</h2>
           <div className="w-16 h-1 bg-[#6A7B53] mx-auto rounded-full mt-4"></div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12 md:mt-20">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-[#F0EBE1] pb-10">
            <div>
               <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#6A7B53] font-extrabold mb-2">Hoạt động gần đây</p>
               <h3 className="font-display text-3xl md:text-4xl font-bold">Lịch sử đặt món</h3>
            </div>
            {!loading && orders.length > 0 && (
               <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/40">Đang hiển thị {orders.length} đơn hàng</p>
            )}
         </div>

         {loading && (
           <div className="py-20 flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-[#6A7B53] border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#6A7B53]">Đang lật giở sổ sách...</p>
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
              <p className="text-[#1A1A1A]/50 font-bold uppercase tracking-widest text-xs mb-8">Bạn chưa có đơn hàng nào được ghi nhận.</p>
              <button 
                onClick={() => navigate('/menu')}
                className="px-10 py-4 bg-[#6A7B53] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#1C2B1C] transition-all"
              >Khám phá menu</button>
           </div>
         )}

         {!loading && !error && orders.length > 0 && (
           <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
             {orders.map((order) => {
               const meta = statusMeta[order.status] || statusMeta.PENDING;
               return (
                 <div key={order.id} className="bg-white border border-[#F0EBE1] p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all hover:border-[#6A7B53]/20 group">
                    <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-[#F0EBE1]/50">
                       <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/40">Mã định danh đơn</p>
                          <h4 className="font-display text-2xl font-bold text-[#1A1A1A]">Đơn #{order.id}</h4>
                       </div>
                       <div className={`px-4 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${meta.tone} shadow-sm`}>
                          {meta.label}
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-[#F0EBE1]">
                          <p className="text-[9px] uppercase tracking-widest font-extrabold text-[#1A1A1A]/40 mb-3 ml-1">Chi tiết phục vụ</p>
                          <div className="space-y-2 text-sm font-bold text-[#1A1A1A]/80">
                             <p className="flex justify-between"><span>Hình thức:</span> <span className="text-[#6A7B53]">{typeLabels[order.orderType] || "Khác"}</span></p>
                             <p className="flex justify-between"><span>Thanh toán:</span> <span>{paymentLabels[order.paymentMethod] || "Chưa chọn"}</span></p>
                             <p className="flex justify-between"><span>Ghi chú:</span> <span className="font-normal italic text-[#1A1A1A]/60">"{meta.note}"</span></p>
                          </div>
                       </div>

                       <div className="flex items-end justify-between px-2">
                          <div>
                             <p className="text-[9px] uppercase tracking-widest font-extrabold text-[#1A1A1A]/40">Thành tiền</p>
                             <p className="text-3xl font-display font-bold text-[#B8860B] mt-1">{formatPriceVND(order.totalPrice || 0)}</p>
                          </div>
                          <button 
                            className="bg-[#FAFAFA] border border-[#F0EBE1] text-[9px] uppercase tracking-widest font-bold px-5 py-2.5 rounded-xl hover:bg-[#6A7B53] hover:text-white hover:border-[#6A7B53] transition-all"
                            onClick={() => addToast({type: 'info', title: `Đơn #${order.id}`, message: 'Tính năng chi tiết đang cập nhật.'})}
                          >
                            Xem Chi Tiết Món
                          </button>
                       </div>
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

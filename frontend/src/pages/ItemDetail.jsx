import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getProductById } from "../lib/api.js";
import LoadingOverlay from "../components/LoadingOverlay.jsx";
import { formatPriceVND } from "../utils/price.js";

const normalizePrice = (value) => {
  if (value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
};

export default function ItemDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const res = await getProductById(id);
      if (!active) return;
      if (res.status >= 200 && res.status < 300) {
        const data = res.data?.data;
        if (data) {
          setItem({
            id: data.id,
            name: data.name,
            description: data.description || "Hương vị truyền thống được truyền qua nhiều thế hệ, nướng bằng than hoa thơm lừng.",
            price: normalizePrice(data.price),
            category: data.categoryName || "Khác",
            tag: data.categoryName || "Món tâm điểm",
            mood: "Thơm nồng - Đậm đà",
            imageUrl: data.imageUrl || ""
          });
        }
      }
      setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [id]);

  const handleAddToCart = () => {
    if (!item) return;
    for (let i = 0; i < quantity; i++) {
      addItem(item);
    }
    addToast({
      type: "success",
      title: "Đã thêm vào giỏ",
      message: `${quantity}x ${item.name} đã được chọn.`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <LoadingOverlay variant="page" label="Đầu bếp đang chuẩn bị..." />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center px-4 text-center">
        <h3 className="font-display text-3xl text-[#1A1A1A] mb-4">Không tìm thấy món ăn</h3>
        <p className="text-[#1A1A1A]/60 mb-8 max-w-sm">Món này có vẻ đang tạm hết hoặc không tồn tại trong mẹt thực đơn hôm nay.</p>
        <Link className="px-8 py-3 bg-[#6A7B53] text-white rounded-full font-bold uppercase tracking-widest text-[10px]" to="/menu">
          Quay lại thực đơn
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] min-h-screen text-[#1A1A1A] font-sans overflow-x-hidden pb-20">
      <style>
        {`
          .reveal {
            animation:reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
          }
          @keyframes reveal {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .glass-panel {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid #F0EBE1;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
          }
           .hero-overlay {
            background: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, rgba(253,251,247,1) 100%);
          }
        `}
      </style>

      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[65vh] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.8] sepia-[0.1]"
          style={{ backgroundImage: `url(${item.imageUrl || "/images/z7699819283762_3634071596ff124321b8dd68e057bc54.jpg"})` }}
        ></div>
        <div className="absolute inset-0 hero-overlay"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full mt-20">
          <div className="reveal">
            <Link to="/menu" className="text-[10px] uppercase tracking-[0.4em] text-white/80 hover:text-white mb-6 inline-flex items-center gap-2 group transition-all">
              <span className="group-hover:-translate-x-2 transition-transform">←</span> Quay lại thực đơn
            </Link>
            <h1 className="font-display text-4xl md:text-7xl lg:text-8xl text-white font-bold tracking-wide mt-4 mb-6 drop-shadow-2xl">{item.name}</h1>
            <div className="flex gap-4 items-center">
              <span className="bg-[#6A7B53] text-white text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                {item.tag}
              </span>
              <span className="text-white/90 text-sm md:text-lg font-medium tracking-[0.2em] uppercase italic">
                {item.mood}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 -mt-16 md:-mt-24 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left Side: Product Info */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="glass-panel rounded-3xl p-8 md:p-12 reveal">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-[#F0EBE1]">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#8B7355] font-bold">Danh mục</p>
                  <p className="text-xl md:text-2xl font-display font-bold">{item.category}</p>
                </div>
                <div className="text-left md:text-right">
                   <p className="text-[10px] uppercase tracking-[0.3em] text-[#8B7355] font-bold mb-1">Giá phục vụ</p>
                   <p className="text-4xl md:text-5xl font-display text-[#B8860B] font-bold">{formatPriceVND(item.price)}</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">Giới thiệu món ăn</h3>
                  <p className="text-[#1A1A1A]/70 text-base md:text-lg leading-[2] font-medium bg-[#FAFAFA] p-6 rounded-2xl border border-[#F0EBE1] italic">
                    "{item.description}"
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-6">
                  <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-[#F0EBE1]/50">
                    <h4 className="font-display text-lg md:text-xl font-bold mb-4 flex items-center gap-3">
                       <span className="w-8 h-8 rounded-full bg-[#6A7B53]/10 flex items-center justify-center text-[#6A7B53]">🍃</span>
                       Gợi ý kèm theo
                    </h4>
                    <ul className="space-y-3 text-sm text-[#1A1A1A]/60 font-semibold uppercase tracking-wider">
                      <li className="flex items-center gap-2">• Rau sống tươi ngon hái trong ngày</li>
                      <li className="flex items-center gap-2">• Nước chấm chua ngọt nêm nếm gia truyền</li>
                      <li className="flex items-center gap-2">• Dưa góp giòn sần sật</li>
                    </ul>
                  </div>

                  <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-[#F0EBE1]/50">
                    <h4 className="font-display text-lg md:text-xl font-bold mb-4 flex items-center gap-3">
                       <span className="w-8 h-8 rounded-full bg-[#B8860B]/10 flex items-center justify-center text-[#B8860B]">🔥</span>
                       Chế biến chuyên sâu
                    </h4>
                    <p className="text-xs md:text-sm text-[#1A1A1A]/60 leading-relaxed font-medium">
                      Thịt được tẩm ướp đậm đà, nướng trực tiếp trên than củi hồng để giữ trọn vị khói và độ mọng nước bên trong thớ thịt.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery/Story snippet */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 reveal" style={{ animationDelay: '0.2s' }}>
               <div className="aspect-square rounded-2xl overflow-hidden border border-[#F0EBE1] shadow-sm">
                  <img src="/images/z7699818623770_8a62f4a85b03b59c3ced823381b7ec55.jpg" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Process 1" />
               </div>
               <div className="aspect-square rounded-2xl overflow-hidden border border-[#F0EBE1] shadow-sm">
                  <img src="/images/z7699820424452_f8d7ab08e70eeb92e0f51c7d1a7c1b76.jpg" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Process 2" />
               </div>
               <div className="aspect-square rounded-2xl overflow-hidden border border-[#F0EBE1] shadow-sm hidden md:block">
                  <img src="/images/z7699819283762_3634071596ff124321b8dd68e057bc54.jpg" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Process 3" />
               </div>
            </div>
          </div>

          {/* Right Side: Order Panel */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 h-fit reveal" style={{ animationDelay: '0.3s' }}>
            <div className="glass-panel rounded-3xl p-8 md:p-10 border-t-4 border-t-[#6A7B53]">
               <h4 className="font-display text-2xl font-bold mb-8"> Đặt món ngay</h4>
               
               <div className="space-y-8">
                  <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-2xl border border-[#F0EBE1]">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/50">Số lượng</span>
                    <div className="flex items-center gap-6">
                       <button 
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        className="w-10 h-10 rounded-full border border-[#F0EBE1] flex items-center justify-center text-xl hover:bg-white transition-all shadow-sm"
                       >-</button>
                       <span className="font-display text-2xl font-bold w-4 text-center">{quantity}</span>
                       <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-full border border-[#F0EBE1] flex items-center justify-center text-xl hover:bg-white transition-all shadow-sm"
                       >+</button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-end mb-8">
                       <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#1A1A1A]/40">Tổng tính</span>
                       <span className="text-3xl font-display font-bold text-[#B8860B]">{formatPriceVND(item.price * quantity)}</span>
                    </div>

                    <button 
                      onClick={handleAddToCart}
                      className="w-full py-5 bg-[#6A7B53] text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] shadow-xl hover:bg-[#1C2B1C] transition-all transform active:scale-95 shadow-[0_15px_30px_rgba(106,123,83,0.3)] mb-4"
                    >
                      Thêm Vào Giỏ Hàng
                    </button>
                    <p className="text-[9px] text-[#1A1A1A]/40 text-center uppercase tracking-widest font-semibold flex items-center justify-center gap-2 mt-4">
                       <span className="w-4 h-px bg-[#F0EBE1]"></span>
                       Phục vụ tận tâm - Trọn vẹn vị quê
                       <span className="w-4 h-px bg-[#F0EBE1]"></span>
                    </p>
                  </div>
               </div>

               <div className="mt-12 pt-10 border-t border-[#F0EBE1] space-y-6">
                  <div className="flex gap-4">
                     <span className="text-xl">🛵</span>
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Giao hàng cực nhanh</p>
                        <p className="text-xs text-[#1A1A1A]/50">Ước tính 15 - 25 phút trong khu vực.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <span className="text-xl">🥗</span>
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Đồ tươi mỗi ngày</p>
                        <p className="text-xs text-[#1A1A1A]/50">Cam kết không dùng thực phẩm qua đêm.</p>
                     </div>
                  </div>
               </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Aesthetic Footer Detail */}
      <div className="max-w-7xl mx-auto px-6 py-24 text-center opacity-40">
         <p className="font-display italic text-2xl md:text-3xl">"Chưa ăn Bún Chả Chinh Hương, coi như chưa về Bỉm Sơn."</p>
      </div>
    </div>
  );
}

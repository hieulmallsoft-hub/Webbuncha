import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useEffect } from "react";
import { formatPriceVND } from "../utils/price.js";

export default function Cart() {
  const { items, updateQty, removeItem, summary } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll('.slide-reveal').forEach(el => el.classList.add('is-visible'));
    }, 100);
    return () => clearTimeout(timer);
  }, [items]);

  return (
    <div className="bg-[#FDFBF7] min-h-screen text-[#1A1A1A] font-sans selection:bg-[#6A7B53] selection:text-white pb-24 md:pb-32 overflow-hidden">
      <style>
        {`
          .slide-reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .slide-reveal.is-visible {
            opacity: 1;
            transform: translateY(0);
          }
          .light-glass-panel {
            background: #FFFFFF;
            border: 1px solid #F0EBE1;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
            border-radius: 24px;
          }
          .bamboo-badge {
            background: #6A7B53;
            color: white;
            box-shadow: 0 4px 10px rgba(106, 123, 83, 0.2);
          }
        `}
      </style>

      {/* Cinematic Banner */}
      <section className="relative h-[40vh] md:h-[50vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/z7699819243603_affffe459063503d15e039fccfc759e9.jpg')] bg-cover bg-center filter brightness-[0.7] sepia-[0.1]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#FDFBF7]"></div>
        
        <div className="relative z-10 text-center px-4 mt-12 slide-reveal">
          <span className="inline-block px-6 py-2 border border-white/40 text-[10px] uppercase tracking-[0.5em] text-white mb-6 bg-black/20 backdrop-blur-sm rounded-full">
            Review Your Order
          </span>
          <h2 className="font-display text-4xl md:text-7xl text-white font-bold mb-4 drop-shadow-2xl tracking-widest uppercase">
            Giỏ Hàng
          </h2>
          <div className="w-16 h-1 bg-[#6A7B53] mx-auto rounded-full"></div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6 md:mt-12 relative z-20 md:-mt-10">
        {items.length === 0 ? (
          <div className="light-glass-panel p-12 md:p-20 text-center slide-reveal max-w-2xl mx-auto border-t-4 border-t-[#6A7B53]">
            <span className="text-4xl mb-6 block">🍃</span>
            <h3 className="font-display text-3xl mb-4 font-bold text-[#1A1A1A]">Giỏ hàng đang trống</h3>
            <p className="text-[#1A1A1A]/60 mb-10 leading-relaxed text-sm md:text-base font-medium">Mời quý khách xem qua các mẹt bún chả thơm lừng vừa ra lò tại thực đơn.</p>
            <Link className="inline-block px-10 py-4 bg-[#6A7B53] text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#1C2B1C] transition-all shadow-lg rounded" to="/menu">
              Khám phá thực đơn
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-start">
            
            {/* Left Column: List */}
            <div className="lg:col-span-8 space-y-8 slide-reveal">
               <div className="flex items-center gap-4 mb-2">
                 <div className="w-10 h-0.5 bg-[#6A7B53]"></div>
                 <h3 className="font-display text-2xl md:text-3xl font-bold text-[#1A1A1A]">Đơn Hàng Đã Chọn</h3>
               </div>

               <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 light-glass-panel p-5 md:p-6 transition-all hover:border-[#6A7B53]/30">
                       <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-[#FAFAFA] border border-[#F0EBE1] shrink-0 p-1">
                          <img 
                            src={item.imageUrl || "/images/z7699818644305_2d4593c168855b379e693ea8a463137d.jpg"} 
                            alt={item.name} 
                            className="w-full h-full object-cover rounded-xl filter sepia-[0.1]" 
                          />
                       </div>

                       <div className="flex-grow text-center sm:text-left">
                          <h4 className="font-display text-xl md:text-2xl font-bold text-[#1A1A1A] mb-1">{item.name}</h4>
                          <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-[#6A7B53] mb-3">{item.category}</p>
                          <div className="flex items-center justify-center sm:justify-start gap-3">
                             <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/40">Đơn giá:</span>
                             <span className="text-sm font-bold text-[#1A1A1A]/80">{formatPriceVND(item.price)}</span>
                          </div>
                       </div>

                       <div className="flex items-center gap-6 md:gap-10">
                          <div className="flex items-center border border-[#F0EBE1] rounded-xl bg-[#FAFAFA] p-1 shadow-inner">
                            <button 
                              onClick={() => item.qty > 1 && updateQty(item.id, item.qty - 1)}
                              className="w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-white rounded-lg transition-all"
                            >-</button>
                            <input
                              type="number"
                              min="1"
                              readOnly
                              value={item.qty}
                              className="w-12 bg-transparent text-center text-[#1A1A1A] focus:outline-none font-bold font-display text-lg"
                            />
                             <button 
                              onClick={() => updateQty(item.id, item.qty + 1)}
                              className="w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-white rounded-lg transition-all"
                            >+</button>
                          </div>

                          <div className="w-24 text-center sm:text-right font-display text-xl md:text-2xl font-bold text-[#B8860B]">
                             {formatPriceVND(item.price * item.qty)}
                          </div>

                          <button 
                            onClick={() => removeItem(item.id)}
                            className="p-3 text-[#1A1A1A]/30 hover:text-red-500 transition-colors"
                            title="Xóa món"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Right Column: Checkout Widget */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 slide-reveal" style={{ transitionDelay: '0.2s' }}>
               <div className="light-glass-panel p-8 md:p-10 border-t-4 border-t-[#6A7B53]">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-[#6A7B53] font-bold mb-4">Kết Tính Mẹt Món</p>
                  <h4 className="font-display text-3xl font-bold text-[#1A1A1A] mb-8 border-b border-[#F0EBE1] pb-6">Thanh Toán</h4>

                  <div className="space-y-6 text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/60 font-bold">
                     <div className="flex justify-between items-center">
                        <span>Giá Gốc</span>
                        <span className="text-[#1A1A1A] font-extrabold text-sm md:text-base">{formatPriceVND(summary.subtotal)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span>Phí phục vụ</span>
                        <span className="text-[#1A1A1A] font-extrabold text-sm md:text-base">{formatPriceVND(summary.fee)}</span>
                     </div>
                     <div className="w-full h-px bg-[#F0EBE1] my-4"></div>
                     <div className="flex justify-between items-end">
                        <span className="font-display text-lg text-[#1A1A1A]">Tổng Tiền</span>
                        <span className="text-3xl md:text-4xl font-display font-bold text-[#B8860B]">{formatPriceVND(summary.total)}</span>
                     </div>
                  </div>

                  <div className="mt-12 space-y-4">
                     <Link to="/checkout" className="block w-full text-center py-5 bg-[#6A7B53] text-white text-[10px] md:text-xs uppercase tracking-[0.4em] font-extrabold hover:bg-[#1C2B1C] transition-all shadow-xl rounded-lg">
                        Tiến Hành Đặt Bàn
                     </Link>
                     <p className="text-[9px] text-[#1A1A1A]/40 text-center uppercase tracking-widest font-semibold flex items-center justify-center gap-2 mt-4">
                        <span className="w-4 h-px bg-[#F0EBE1]"></span>
                        Hoàn tất mẹt món quê nhà
                        <span className="w-4 h-px bg-[#F0EBE1]"></span>
                     </p>
                  </div>
               </div>
               
               <div className="mt-8 light-glass-panel p-6 border border-[#6A7B53]/10 flex flex-col items-center text-center">
                  <span className="text-2xl mb-2">🎁</span>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#6A7B53]">Ưu Đãi Quà Tặng</p>
                  <p className="text-[10px] text-[#1A1A1A]/50 mt-2 font-medium">Nhập mã giảm giá ở bước tiếp theo để nhận ưu đãi nước uống miễn phí.</p>
               </div>
            </aside>

          </div>
        )}
      </div>
    </div>
  );
}

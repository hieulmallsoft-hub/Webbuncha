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
    <div className="bg-[#FDF5E6] min-h-screen text-[#3E2723] font-sans selection:bg-[#C84B31] selection:text-white pb-24 md:pb-32 overflow-hidden">
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
            background: #FFFDF8;
            border: 1px solid #E8D8C8;
            box-shadow: 0 15px 40px rgba(200, 75, 49, 0.05);
            border-radius: 28px;
          }
          .bamboo-badge {
            background: #C84B31;
            color: white;
            box-shadow: 0 4px 10px rgba(200, 75, 49, 0.2);
          }
        `}
      </style>

      {/* Cinematic Banner */}
      <section className="relative h-[40vh] md:h-[50vh] flex flex-col items-center justify-center overflow-hidden border-b-[8px] border-[#C84B31]">
        <div className="absolute inset-0 bg-[url('/images/z7699819243603_affffe459063503d15e039fccfc759e9.jpg')] bg-cover bg-center filter brightness-[0.75] sepia-[0.35] contrast-[1.1] transition-transform duration-[10s] hover:scale-105"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#2E1503]/50 via-transparent to-[#FDF5E6]"></div>
        
        <div className="relative z-10 text-center px-4 mt-12 slide-reveal">
          <span className="inline-block px-8 py-2.5 border border-[#FDF5E6]/40 text-[10px] uppercase tracking-[0.5em] font-bold text-[#FDF5E6] mb-6 bg-[#2E1503]/30 backdrop-blur-md rounded-lg ring-1 ring-[#D97706]/40">
            Mâm Cỗ Chờ Sẵn
          </span>
          <h2 className="font-display text-4xl md:text-7xl text-[#FDF5E6] font-bold mb-6 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] tracking-widest uppercase text-shadow-xl flex items-center justify-center gap-4">
            <span className="text-[#D97706] opacity-60">~</span>
            Giỏ Hàng
            <span className="text-[#D97706] opacity-60">~</span>
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-transparent via-[#C84B31] to-transparent mx-auto rounded-full"></div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6 md:mt-12 relative z-20 md:-mt-10">
        {items.length === 0 ? (
          <div className="light-glass-panel p-12 md:p-20 text-center slide-reveal max-w-2xl mx-auto border-t-[6px] border-t-[#C84B31] bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]">
            <span className="text-5xl mb-6 block drop-shadow-md">🥢</span>
            <h3 className="font-display text-3xl md:text-4xl mb-4 font-bold text-[#3E2723]">Mẹt Quê Đang Trống</h3>
            <p className="text-[#3E2723]/70 mb-10 leading-relaxed text-sm md:text-base font-semibold">Mời quý khách dạo quanh thực đơn để thêm vài suất bún chả thơm lừng vừa ra lò.</p>
            <Link className="inline-block px-12 py-5 bg-gradient-to-r from-[#C84B31] to-[#A03520] text-[#FDF5E6] text-[10px] uppercase tracking-[0.4em] font-extrabold hover:-translate-y-2 transition-transform duration-300 shadow-[0_15px_30px_rgba(200,75,49,0.3)] rounded-lg ring-2 ring-[#C84B31]/40 ring-offset-2 ring-offset-[#FDF5E6]" to="/menu">
              Khám Phá Thực Đơn
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-start">
            
            {/* Left Column: List */}
            <div className="lg:col-span-8 space-y-8 slide-reveal">
               <div className="flex items-center gap-4 mb-2">
                 <div className="w-12 h-1 rounded-full bg-[#C84B31]"></div>
                 <h3 className="font-display text-2xl md:text-4xl font-bold text-[#3E2723]">Đơn Hàng Của Bạn</h3>
               </div>

               <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="group flex flex-col sm:flex-row items-center gap-6 light-glass-panel p-5 md:p-6 transition-all duration-500 hover:border-[#C84B31]/30 hover:shadow-[0_20px_40px_rgba(200,75,49,0.1)] hover:-translate-y-1 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]">
                       <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-[#FAF3E8] border border-[#E8D8C8] shrink-0 p-1 relative">
                          <img 
                            src={item.imageUrl || "/images/z7699818644305_2d4593c168855b379e693ea8a463137d.jpg"} 
                            alt={item.name} 
                            className="w-full h-full object-cover rounded-[14px] filter sepia-[0.2] contrast-[1.05] group-hover:scale-110 transition-transform duration-700" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#2E1503]/20 to-transparent rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       </div>

                       <div className="flex-grow text-center sm:text-left">
                          <h4 className="font-display text-xl md:text-2xl font-bold text-[#3E2723] mb-1 group-hover:text-[#C84B31] transition-colors">{item.name}</h4>
                          <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-extrabold text-[#D97706] mb-4">{item.category}</p>
                          <div className="flex items-center justify-center sm:justify-start gap-4">
                             <span className="text-[10px] uppercase font-bold text-[#3E2723]/50">Đơn giá</span>
                             <span className="text-sm md:text-base font-extrabold text-[#3E2723] px-3 py-1 bg-[#FAF3E8] rounded-md border border-[#E8D8C8]">{formatPriceVND(item.price)}</span>
                          </div>
                       </div>

                       <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-6 md:gap-10 mt-4 sm:mt-0">
                          <div className="flex items-center border-2 border-[#E8D8C8]/60 rounded-xl bg-[#FAF3E8] p-1 shadow-inner group-hover:border-[#C84B31]/30 transition-colors">
                            <button 
                              onClick={() => item.qty > 1 && updateQty(item.id, item.qty - 1)}
                              className="w-10 h-10 flex items-center justify-center text-xl font-bold text-[#C84B31] hover:bg-white rounded-lg transition-all"
                            >-</button>
                            <input
                              type="number"
                              min="1"
                              readOnly
                              value={item.qty}
                              className="w-14 bg-transparent text-center text-[#3E2723] focus:outline-none font-bold font-display text-xl"
                            />
                             <button 
                              onClick={() => updateQty(item.id, item.qty + 1)}
                              className="w-10 h-10 flex items-center justify-center text-xl font-bold text-[#C84B31] hover:bg-white rounded-lg transition-all"
                            >+</button>
                          </div>

                          <div className="w-28 text-center sm:text-right font-display text-2xl md:text-3xl font-bold text-[#D97706] drop-shadow-sm">
                             {formatPriceVND(item.price * item.qty)}
                          </div>

                          <button 
                            onClick={() => removeItem(item.id)}
                            className="p-4 bg-[#FAF3E8] text-[#3E2723]/40 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors border border-[#E8D8C8] hover:border-red-200"
                            title="Xóa món"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Right Column: Checkout Widget */}
            <aside className="lg:col-span-4 lg:sticky lg:top-32 slide-reveal" style={{ transitionDelay: '0.2s' }}>
               <div className="light-glass-panel p-8 md:p-10 border-t-[6px] border-t-[#C84B31] bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D97706]/10 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <p className="text-[10px] uppercase tracking-[0.5em] text-[#C84B31] font-extrabold mb-4 flex items-center gap-2">
                    <span className="w-4 h-px bg-[#C84B31]"></span>
                    Kết Tính Mẹt Món
                  </p>
                  <h4 className="font-display text-3xl md:text-4xl font-bold text-[#3E2723] mb-8 border-b-2 border-dashed border-[#E8D8C8] pb-6 relative">
                    Thanh Toán
                    <span className="absolute -bottom-1.5 left-0 w-8 h-1 bg-[#D97706] rounded-full"></span>
                  </h4>

                  <div className="space-y-6 text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[#3E2723]/70 font-bold">
                     <div className="flex justify-between items-center bg-[#FAF3E8] p-4 rounded-xl border border-[#E8D8C8]/60">
                        <span>Giá Gốc</span>
                        <span className="text-[#3E2723] font-black text-sm md:text-base">{formatPriceVND(summary.subtotal)}</span>
                     </div>
                     <div className="flex justify-between items-center px-4">
                        <span className="flex items-center gap-2">Phí phục vụ <svg className="w-3 h-3 text-[#D97706]" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,19.93C7.06,19.43 4.22,15.95 4.5,12H11V19.93M13,4.07C16.94,4.57 19.78,8.05 19.5,12H13V4.07Z"/></svg></span>
                        <span className="text-[#3E2723] font-black text-sm md:text-base">{formatPriceVND(summary.fee)}</span>
                     </div>
                     
                     <div className="mt-8 pt-6 border-t-2 border-[#E8D8C8] flex justify-between items-end bg-[#FFFDF8]">
                        <div>
                          <span className="font-display text-base text-[#3E2723] block mb-1">Tổng Tiền</span>
                          <span className="text-[8px] tracking-[0.3em] font-medium text-[#C84B31]">(Đã bao gồm VAT)</span>
                        </div>
                        <span className="text-3xl md:text-5xl font-display font-black text-[#D97706] drop-shadow-md">{formatPriceVND(summary.total)}</span>
                     </div>
                  </div>

                  <div className="mt-12 space-y-5">
                     <Link to="/checkout" className="flex items-center justify-center gap-4 w-full py-5 md:py-6 bg-gradient-to-r from-[#C84B31] to-[#A03520] text-white text-[10px] md:text-xs uppercase tracking-[0.4em] font-black hover:-translate-y-1 transition-all shadow-[0_10px_30px_rgba(200,75,49,0.4)] rounded-xl ring-2 ring-[#C84B31]/30 ring-offset-2 ring-offset-[#FFFDF8]">
                        Tiến Hành Đặt Bàn
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                     </Link>
                     <p className="text-[9px] text-[#3E2723]/40 text-center uppercase tracking-widest font-bold flex items-center justify-center gap-3">
                        <span className="w-6 h-px bg-[#E8D8C8]"></span>
                        Hoàn tất mẹt món quê nhà
                        <span className="w-6 h-px bg-[#E8D8C8]"></span>
                     </p>
                  </div>
               </div>
               
               <div className="mt-8 light-glass-panel p-8 border border-[#D97706]/20 flex flex-col items-center text-center bg-gradient-to-br from-[#FFFDF8] to-[#FAF3E8]">
                  <div className="w-16 h-16 rounded-full bg-[#D97706]/10 flex items-center justify-center mb-4 text-3xl filter drop-shadow-sm">🎁</div>
                  <p className="text-[11px] uppercase font-black tracking-widest text-[#D97706] mb-2">Quà Tặng Thôn Quê</p>
                  <p className="text-[11px] text-[#3E2723]/60 leading-relaxed font-semibold">Tặng ngay nước nụ vối nồng nàn khi mẹt món đạt trên 500K.</p>
               </div>
            </aside>

          </div>
        )}
      </div>
    </div>
  );
}

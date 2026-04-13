import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useEffect } from "react";

export default function Cart() {
  const { items, updateQty, removeItem, summary } = useCart();

  useEffect(() => {
    setTimeout(() => {
      document.querySelectorAll('.slide-presentation').forEach(el => el.classList.add('is-visible'));
    }, 100);
  }, [items]);

  return (
    <div className="bg-[#1c1917] min-h-screen text-gray-100 font-sans selection:bg-gold selection:text-black pb-32">
      <style>
        {`
          .slide-presentation {
            opacity: 0;
            transform: translateY(30px);
            transition: all 1s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          .slide-presentation.is-visible {
            opacity: 1;
            transform: translateY(0);
          }
          .glass-panel {
            background: rgba(20, 20, 20, 0.6);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          }
        `}
      </style>

      {/* Cinematic Hero */}
      <section className="relative h-[50vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/z7699819243603_affffe459063503d15e039fccfc759e9.jpg')] bg-cover bg-center bg-fixed filter brightness-50"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1c1917]/50 to-[#1c1917]"></div>
        
        <div className="relative z-10 text-center px-6 mt-16 max-w-4xl mx-auto slide-presentation">
          <span className="inline-block px-6 py-2 border border-gold/30 text-[10px] uppercase tracking-[0.5em] text-gold mb-6 bg-black/30 backdrop-blur-md">
            Order Review
          </span>
          <h2 className="font-display text-5xl md:text-7xl text-white mb-6 uppercase tracking-widest drop-shadow-2xl">
            Giỏ Hàng
          </h2>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        {items.length === 0 ? (
          <div className="glass-panel p-16 text-center rounded-2xl slide-presentation w-full max-w-2xl mx-auto">
            <h3 className="font-display text-3xl mb-4 text-white">Giỏ hàng đang trống</h3>
            <p className="text-gray-400 mb-8 leading-loose text-sm uppercase tracking-widest">Hãy bắt đầu từ thực đơn để tạo một bữa ăn trọn vị.</p>
            <Link className="px-10 py-4 bg-gold text-[#0a0a0a] text-xs uppercase tracking-[0.3em] font-bold hover:bg-white transition-all shadow-xl" to="/menu">
              Khám phá thực đơn
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12">
            
            {/* Left: Item List */}
            <section className="slide-presentation" style={{ transitionDelay: '100ms' }}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-px bg-gold"></div>
                <h3 className="font-display text-3xl text-white">Danh Sách Món</h3>
              </div>
              
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 glass-panel p-6 rounded-2xl">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/5">
                        <img 
                            src={item.imageUrl || "/images/z7699818644305_2d4593c168855b379e693ea8a463137d.jpg"} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="font-display text-2xl text-white mb-2">{item.name}</h4>
                      <p className="text-xs uppercase tracking-[0.2em] text-gold/80">{item.category}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                      <div className="flex items-center border border-white/20 rounded-md overflow-hidden bg-white/5">
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(event) => updateQty(item.id, Number(event.target.value))}
                          className="w-16 px-4 py-2 bg-transparent text-center text-white focus:outline-none"
                        />
                      </div>
                      
                      <div className="w-20 text-center sm:text-right">
                        <span className="text-xl font-bold text-white">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                      
                      <button
                        type="button"
                        className="text-[10px] uppercase font-bold tracking-widest text-[#ef4444] hover:text-white transition-colors"
                        onClick={() => removeItem(item.id)}
                      >
                        Loại Bỏ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Right: Summary Order */}
            <aside className="slide-presentation" style={{ transitionDelay: '300ms' }}>
              <div className="glass-panel p-10 rounded-2xl sticky top-32">
                <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold mb-4">Tổng Kết Đơn</p>
                <h4 className="font-display text-4xl text-white mb-8 border-b border-white/10 pb-6">Thanh Toán</h4>
                
                <div className="space-y-6 text-sm uppercase tracking-widest text-gray-400">
                  <div className="flex justify-between items-center">
                    <span>Tạm tính</span>
                    <span className="text-white">${summary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Phí dịch vụ</span>
                    <span className="text-white">${summary.fee.toFixed(2)}</span>
                  </div>
                  
                  <div className="w-full h-px bg-white/10 my-4"></div>
                  
                  <div className="flex justify-between items-center text-xl font-display font-bold text-white">
                    <span>Tổng Cảnh</span>
                    <span className="text-gold text-3xl">${summary.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-12">
                  <Link className="block w-full text-center px-10 py-5 bg-gold text-[#0a0a0a] text-xs uppercase tracking-[0.3em] font-extrabold hover:bg-white transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)]" to="/checkout">
                    Tiến Hành Đặt Bàn
                  </Link>
                </div>
              </div>
            </aside>
            
          </div>
        )}
      </div>
    </div>
  );
}

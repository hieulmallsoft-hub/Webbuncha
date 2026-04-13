import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../lib/api.js";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

const normalizePrice = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }
  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
};

export default function Home() {
  const [highlights, setHighlights] = useState([]);
  const [loadingHighlights, setLoadingHighlights] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoadingHighlights(true);
      const res = await getProducts();
      if (!active) return;
      if (res.status >= 200 && res.status < 300) {
        const data = res.data?.data || [];
        const mapped = data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || "Hương vị truyền thống, đánh thức mọi giác quan với công thức độc quyền.",
          price: normalizePrice(item.price),
          category: item.categoryName || "Khác",
          tag: item.categoryName || "Món nổi bật"
        }));
        setHighlights(mapped.slice(0, 6));
      } else {
        setHighlights([]);
      }
      setLoadingHighlights(false);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            // Optional: Remove class when scrolling out for re-triggering presentation effect
            // entry.target.classList.remove("is-visible"); 
          }
        });
      },
      { threshold: 0.15 }
    );

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(".slide-left, .slide-right, .slide-up, .zoom-in");
      elements.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [loadingHighlights, highlights]);

  return (
    <div className="bg-[#1c1917] min-h-screen text-gray-100 font-sans selection:bg-gold selection:text-black overflow-hidden">
      <style>
        {`
          .slide-left {
            opacity: 0;
            transform: translateX(-100px);
            transition: opacity 1.2s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          .slide-right {
            opacity: 0;
            transform: translateX(100px);
            transition: opacity 1.2s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          .slide-up {
            opacity: 0;
            transform: translateY(80px);
            transition: opacity 1.2s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          .zoom-in {
            opacity: 0;
            transform: scale(0.9);
            transition: opacity 1.4s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          .slide-left.is-visible, .slide-right.is-visible, .slide-up.is-visible, .zoom-in.is-visible {
            opacity: 1;
            transform: translateX(0) translateY(0) scale(1);
          }
          .custom-gold-text {
            background: linear-gradient(to right, #f5e6ad, #d4af37, #aa8c2c);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0px 4px 20px rgba(212, 175, 55, 0.2);
          }
          .cinematic-hero-home {
            background-image: url('/images/z7699819298138_5ea6bacf9d760fe5a02bd43fc7c1569b.jpg');
            background-attachment: fixed;
            background-size: cover;
            background-position: center;
          }
        `}
      </style>

      {/* Cinematic Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 cinematic-hero-home scale-105 filter brightness-[0.5]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050505]"></div>
        
        <div className="relative z-10 text-center px-6 mt-20 max-w-5xl mx-auto">
          <div className="slide-up" style={{ transitionDelay: '100ms' }}>
            <span className="inline-block px-8 py-3 border border-gold/40 text-xs md:text-sm uppercase tracking-[0.4em] font-semibold text-gold mb-8 bg-black/40 backdrop-blur-md shadow-lg">
              Trải Nghiệm Ẩm Thực Đỉnh Cao
            </span>
          </div>
          
          <h2 className="font-display text-6xl md:text-8xl lg:text-9xl text-white mb-10 tracking-wide leading-[1.1] slide-up drop-shadow-2xl" style={{ transitionDelay: '300ms' }}>
            Hương Vị <br /> <span className="custom-gold-text italic pr-4">Bỉm Sơn</span>
          </h2>
          
          <p className="text-gray-200 text-base md:text-xl max-w-2xl mx-auto mb-16 leading-relaxed tracking-widest uppercase slide-up font-medium drop-shadow-lg" style={{ transitionDelay: '500ms' }}>
            Nghệ thuật nướng than hoa truyền thống giao thoa cùng không gian sang trọng bậc nhất.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center slide-up" style={{ transitionDelay: '700ms' }}>
            <Link className="px-12 py-5 bg-gold text-black text-sm uppercase tracking-[0.3em] font-extrabold hover:bg-white transition-all duration-500 shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:-translate-y-2" to="/menu">
              Khám phá thực đơn
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-40 px-6 relative">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 items-center gap-24">
          <div className="space-y-12 slide-left">
            <div className="flex items-center gap-6">
              <div className="w-20 h-1 bg-gold"></div>
              <span className="text-sm md:text-base uppercase tracking-[0.4em] text-gold font-extrabold">The Heritage</span>
            </div>
            
            <h3 className="font-display text-5xl md:text-7xl leading-[1.15] text-white font-semibold">
              Bắt đầu từ một <br /> <span className="italic custom-gold-text">Bếp Than Hoa</span>
            </h3>
            
            <p className="text-lg text-gray-300 leading-loose max-w-xl font-medium">
              Chinh Hương khởi nguồn từ một quán nhỏ ở phố cổ, nơi mùi chả nướng lan tỏa khắp ngõ nhỏ. Chúng tôi trân trọng và giữ gìn trọn vẹn cách ướp thịt mang phong cách gia truyền để hương vị không bao giờ đổi thay.
            </p>
            
            <div className="pt-6">
              <Link to="/about" className="group inline-flex items-center gap-4 text-sm uppercase tracking-[0.3em] font-bold text-white transition-colors hover:text-gold">
                <span className="border-b-2 border-gold pb-2 group-hover:border-white transition-colors">Tìm hiểu thêm câu chuyện</span>
                <svg className="w-6 h-6 transform group-hover:translate-x-3 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="relative slide-right">
            <div className="absolute -inset-6 border-2 border-gold/30 translate-x-6 -translate-y-6 z-0"></div>
            <div className="aspect-[4/5] overflow-hidden relative z-10 shadow-2xl">
               <img 
                src="/images/z7699827552354_755b5c69c8b1297ef9a1201caf3b50cc.jpg" 
                alt="Brand Story" 
                className="w-full h-full object-cover transition-transform duration-[3000ms] hover:scale-110 filter brightness-90 saturate-50 hover:saturate-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Visual Journey - Media Strip */}
      <section className="py-32 bg-[#0a0a0a] overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 mb-20 slide-up">
          <div className="text-center space-y-6">
            <span className="text-sm uppercase tracking-[0.5em] text-gold font-bold block">Visual Journey</span>
            <h2 className="font-display text-5xl md:text-6xl text-white font-bold">Nghệ Thuật Ẩm Thực</h2>
            <div className="w-1 h-24 bg-gradient-to-b from-gold to-transparent mx-auto mt-10"></div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 px-6 h-auto md:h-[600px] zoom-in">
          <div className="flex-[1] overflow-hidden group relative min-h-[300px] rounded-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none"></div>
            <img src="/images/z7699820424452_f8d7ab08e70eeb92e0f51c7d1a7c1b76.jpg" className="w-full h-full object-cover transition-all duration-[2000ms] group-hover:scale-110" alt="Grilled Pork" />
          </div>
          <div className="flex-[1] overflow-hidden group relative min-h-[300px] rounded-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none"></div>
            <img src="/images/z7699819283762_3634071596ff124321b8dd68e057bc54.jpg" className="w-full h-full object-cover transition-all duration-[2000ms] group-hover:scale-110" alt="Noodles" />
          </div>
          <div className="flex-[1.5] overflow-hidden group relative min-h-[300px] rounded-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none"></div>
            <img src="/images/z7699818623770_8a62f4a85b03b59c3ced823381b7ec55.jpg" className="w-full h-full object-cover transition-all duration-[2000ms] group-hover:scale-110" alt="Nem" />
          </div>
        </div>
      </section>

      {/* Highlighted Menu */}
      <section className="py-40 px-6 relative">
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8 slide-right">
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <span className="w-16 h-1 bg-gold"></span>
                <span className="text-sm uppercase tracking-[0.4em] text-gold font-extrabold">Selections</span>
              </div>
              <h3 className="font-display text-6xl md:text-7xl text-white font-bold">Món Chuẩn Vị</h3>
            </div>
            <Link to="/menu" className="text-sm uppercase tracking-[0.3em] font-extrabold text-gray-300 border-b-2 border-gray-600 pb-2 hover:text-gold hover:border-gold transition-all duration-300">
              Xem toàn bộ thực đơn
            </Link>
          </div>

          {loadingHighlights ? (
           <></>
          ) : highlights.length === 0 ? (
            <p className="text-center py-20 text-gray-400 italic font-semibold text-lg">Đang cập nhật thực đơn...</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
              {highlights.map((item, idx) => (
                <div key={item.id} className="group relative slide-up" style={{ transitionDelay: `${(idx * 150) % 600}ms` }}>
                  <div className="aspect-[4/3] overflow-hidden rounded-t-2xl relative bg-[#111]">
                    <img 
                      src={item.imageUrl || "/images/z7699818644305_2d4593c168855b379e693ea8a463137d.jpg"} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  </div>
                  <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] p-8 rounded-b-2xl border border-t-0 border-white/10 group-hover:border-gold/30 transition-colors duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs uppercase tracking-[0.3em] text-gold font-bold bg-gold/10 px-4 py-2 rounded-lg">{item.tag}</span>
                      <span className="text-2xl font-bold text-white group-hover:text-gold transition-colors block">${(item.price).toFixed(2)}</span>
                    </div>
                    <h4 className="font-display text-3xl mb-4 text-white font-semibold group-hover:text-gold transition-all duration-300">{item.name}</h4>
                    <p className="text-sm text-gray-300 leading-loose mb-8 line-clamp-2">{item.description}</p>
                    <Link to={`/menu/${item.id}`} className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.2em] font-bold text-white hover:text-gold transition-colors">
                      Xem chi tiết
                      <span className="w-8 h-0.5 bg-gold"></span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Signature Section */}
      <section className="py-24 relative overflow-hidden bg-[#161412]">
        <div className="mx-auto max-w-5xl text-center px-6 relative z-10 zoom-in">
          <h3 className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-20 leading-[1.2] italic font-semibold">
            "Mỗi phần bún chả là <br /> <span className="custom-gold-text block mt-4">Hương vị Tinh Hoa</span>"
          </h3>
          
          <div className="w-2 h-24 bg-gradient-to-b from-transparent via-gold to-transparent mx-auto"></div>
          
          <p className="text-gray-200 text-sm md:text-base uppercase tracking-[0.5em] mt-16 font-extrabold">
            Đẳng cấp 5 sao giữa lòng thành phố
          </p>
          
          <div className="mt-20">
            <Link to="/checkout" className="px-14 py-6 bg-transparent border-2 border-gold text-gold text-sm uppercase tracking-[0.4em] font-extrabold hover:bg-gold hover:text-black transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_60px_rgba(212,175,55,0.5)]">
              Đặt bàn trực tuyến
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

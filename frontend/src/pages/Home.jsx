import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../lib/api.js";

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
          description: item.description || "Hương vị truyền thống, đánh thức mọi giác quan với công thức mộc mạc quê nhà.",
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
    <div className="bg-[#FDFBF7] min-h-screen text-[#1A1A1A] font-sans selection:bg-[#6A7B53] selection:text-white overflow-hidden relative z-10">
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
          .custom-accent-text {
            background: linear-gradient(to right, #B8860B, #6A7B53);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0px 4px 20px rgba(106, 123, 83, 0.2);
          }
          .cinematic-hero-home {
            background-image: url('/images/z7699819298138_5ea6bacf9d760fe5a02bd43fc7c1569b.jpg');
            background-attachment: fixed;
            background-size: cover;
            background-position: center;
          }
        `}
      </style>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 cinematic-hero-home scale-105 filter brightness-[0.6] sepia-[0.2]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#FDFBF7]"></div>
        
        <div className="relative z-10 text-center px-4 mt-20 max-w-5xl mx-auto w-full">
          <div className="slide-up" style={{ transitionDelay: '100ms' }}>
            <span className="inline-block px-6 md:px-8 py-2.5 md:py-3 border border-[#FDFBF7]/40 text-[9px] md:text-sm uppercase tracking-[0.4em] font-bold text-[#FDFBF7] mb-6 md:mb-8 bg-black/30 backdrop-blur-md shadow-lg rounded-sm">
              Tinh Hoa Ẩm Thực Đồng Quê
            </span>
          </div>
          
          <h2 className="font-display text-5xl md:text-8xl lg:text-9xl text-white mb-6 md:mb-10 tracking-wide leading-[1.1] slide-up drop-shadow-2xl" style={{ transitionDelay: '300ms' }}>
            Hương Vị <br /> <span className="custom-accent-text italic pr-2 md:pr-4">Bỉm Sơn</span>
          </h2>
          
          <p className="text-[#FDFBF7]/90 text-sm md:text-xl max-w-2xl mx-auto mb-10 md:mb-16 leading-relaxed tracking-widest uppercase slide-up font-semibold drop-shadow-md px-4" style={{ transitionDelay: '500ms' }}>
            Nghệ thuật nướng than hoa giao thoa cùng không gian đồng mạc, thanh bình và sang trọng.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 md:gap-8 justify-center items-center slide-up" style={{ transitionDelay: '700ms' }}>
            <Link className="px-10 md:px-12 py-4 md:py-5 bg-[#6A7B53] text-[#FDFBF7] text-[10px] md:text-sm uppercase tracking-[0.3em] font-bold hover:bg-[#1C2B1C] transition-all duration-500 shadow-[0_10px_30px_rgba(106,123,83,0.3)] hover:-translate-y-2 rounded" to="/menu">
              Khám phá thực đơn
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 md:py-40 px-6 relative">
        <div className="absolute left-0 top-1/4 w-32 h-64 bg-gradient-to-r from-[#6A7B53]/5 to-transparent blur-3xl pointer-events-none"></div>
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 items-center gap-16 md:gap-24 relative z-10">
          <div className="space-y-8 md:space-y-12 slide-left">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-12 md:w-20 h-0.5 md:h-1 bg-[#6A7B53]"></div>
              <span className="text-[10px] md:text-base uppercase tracking-[0.4em] text-[#6A7B53] font-extrabold">Hồn Quê Mộc Mạc</span>
            </div>
            
            <h3 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.2] text-[#1A1A1A] font-bold">
              Bắt đầu từ một <br /> <span className="italic custom-accent-text">Bếp Than Hoa</span>
            </h3>
            
            <p className="text-sm md:text-lg text-[#1A1A1A]/70 leading-loose md:leading-[2.2] max-w-xl font-medium">
              Chinh Hương khởi nguồn từ một nếp nhà nhỏ ở làng quê Thanh Hóa, nơi mùi chả nướng lẫn vào khói lam chiều lan tỏa khắp xóm. Chúng tôi trân trọng và đặt hồn mình vào từng cách thái thịt, ướp gia vị truyền thống, giữ vẹn nguyên cái chân chất, mộc mạc của ẩm thực quê nhà.
            </p>
            
            <div className="pt-4 md:pt-6">
              <Link to="/about" className="group inline-flex items-center gap-3 md:gap-4 text-[10px] md:text-sm uppercase tracking-[0.3em] font-bold text-[#1A1A1A] transition-colors hover:text-[#6A7B53]">
                <span className="border-b-2 border-[#6A7B53] pb-1.5 md:pb-2 group-hover:border-[#1A1A1A] transition-colors">Đọc câu chuyện</span>
                <svg className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-3 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="relative slide-right">
            <div className="absolute -inset-4 md:-inset-6 border border-[#6A7B53]/30 translate-x-4 md:translate-x-6 -translate-y-4 md:-translate-y-6 z-0 rounded-2xl"></div>
            <div className="aspect-[4/5] overflow-hidden relative z-10 shadow-2xl rounded-2xl bg-white border border-[#F0EBE1] p-2">
               <div className="w-full h-full overflow-hidden rounded-xl">
                 <img 
                  src="/images/z7699827552354_755b5c69c8b1297ef9a1201caf3b50cc.jpg" 
                  alt="Brand Story" 
                  className="w-full h-full object-cover transition-transform duration-[3000ms] hover:scale-110 filter brightness-[0.95] sepia-[0.15]"
                 />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Journey - Media Strip */}
      <section className="py-24 md:py-32 bg-white border-y border-[#F0EBE1] relative">
        <div className="mx-auto max-w-7xl px-4 md:px-6 mb-16 md:mb-20 slide-up">
          <div className="text-center space-y-4 md:space-y-6">
            <span className="text-[10px] md:text-sm uppercase tracking-[0.5em] text-[#B8860B] font-extrabold block">Bức Tranh Thu Hoạch</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] font-bold">Nghệ Thuật Ẩm Thực</h2>
            <div className="w-[2px] h-16 md:h-24 bg-gradient-to-b from-[#6A7B53] to-transparent mx-auto mt-6 md:mt-10"></div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 px-4 md:px-6 h-auto md:h-[600px] zoom-in max-w-[1400px] mx-auto">
          <div className="flex-[1] overflow-hidden group relative min-h-[250px] md:min-h-[300px] rounded-2xl shadow-lg border border-[#F0EBE1]">
            <img src="/images/z7699820424452_f8d7ab08e70eeb92e0f51c7d1a7c1b76.jpg" className="w-full h-full object-cover transition-all duration-[2000ms] group-hover:scale-[1.15] filter sepia-[0.1]" alt="Grilled Pork" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C2B1C]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          <div className="flex-[1] overflow-hidden group relative min-h-[250px] md:min-h-[300px] rounded-2xl shadow-lg border border-[#F0EBE1]">
            <img src="/images/z7699819283762_3634071596ff124321b8dd68e057bc54.jpg" className="w-full h-full object-cover transition-all duration-[2000ms] group-hover:scale-[1.15] filter sepia-[0.1]" alt="Noodles" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C2B1C]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          <div className="flex-[1.5] overflow-hidden group relative min-h-[250px] md:min-h-[300px] rounded-2xl shadow-lg border border-[#F0EBE1]">
            <img src="/images/z7699818623770_8a62f4a85b03b59c3ced823381b7ec55.jpg" className="w-full h-full object-cover transition-all duration-[2000ms] group-hover:scale-[1.15] filter sepia-[0.1]" alt="Nem" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C2B1C]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>
      </section>

      {/* Highlighted Menu */}
      <section className="py-24 md:py-40 px-4 md:px-6 relative">
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-6 md:gap-8 slide-right">
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-4 md:gap-6">
                <span className="w-10 md:w-16 h-0.5 md:h-1 bg-[#6A7B53]"></span>
                <span className="text-[10px] md:text-sm uppercase tracking-[0.4em] text-[#6A7B53] font-extrabold">Từ mảnh vườn nhỏ</span>
              </div>
              <h3 className="font-display text-4xl md:text-6xl lg:text-7xl text-[#1A1A1A] font-bold">Món Quê Chuẩn Vị</h3>
            </div>
            <Link to="/menu" className="text-[10px] md:text-sm uppercase tracking-[0.3em] font-extrabold text-[#1A1A1A]/50 border-b-2 border-[#1A1A1A]/30 pb-2 hover:text-[#6A7B53] hover:border-[#6A7B53] transition-all duration-300">
              Xem mẹt thực đơn
            </Link>
          </div>

          {loadingHighlights ? (
            <p className="text-center py-20 text-[#1A1A1A]/40 italic font-semibold text-sm">Đang ủ than hoa...</p>
          ) : highlights.length === 0 ? (
            <p className="text-center py-20 text-[#1A1A1A]/40 italic font-semibold text-sm">Chưa có món mới. Bạn đợi một chút nhé...</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-12 gap-y-12 md:gap-y-20">
              {highlights.map((item, idx) => (
                <div key={item.id} className="group relative slide-up bg-white rounded-2xl shadow-lg border border-[#F0EBE1] overflow-hidden hover:shadow-[0_20px_40px_rgba(106,123,83,0.08)] transition-all duration-500" style={{ transitionDelay: `${(idx * 150) % 600}ms` }}>
                  <div className="aspect-[4/3] overflow-hidden relative bg-[#FDFBF7]">
                    <img 
                      src={item.imageUrl || "/images/z7699818644305_2d4593c168855b379e693ea8a463137d.jpg"} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110 filter sepia-[0.1]"
                    />
                    <div className="absolute top-4 left-4">
                       <span className="text-[9px] uppercase tracking-[0.3em] text-white font-bold bg-[#6A7B53]/90 backdrop-blur px-3 py-1.5 rounded-md shadow-sm">{item.tag}</span>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 relative">
                    <div className="absolute right-6 -top-6 w-12 h-12 bg-[#FDFBF7] rounded-full flex items-center justify-center font-bold text-[#1A1A1A] border shadow-sm border-[#F0EBE1] shadow-[0_5px_15px_rgba(0,0,0,0.05)] group-hover:bg-[#6A7B53] group-hover:text-white transition-colors duration-300">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    
                    <h4 className="font-display text-2xl md:text-3xl mb-3 text-[#1A1A1A] font-bold group-hover:text-[#6A7B53] transition-colors">{item.name}</h4>
                    <p className="text-[#1A1A1A]/60 font-semibold mb-4">${(item.price).toFixed(2)}</p>
                    <p className="text-[11px] md:text-sm text-[#1A1A1A]/70 leading-relaxed mb-6 md:mb-8 line-clamp-2 md:line-clamp-3 font-medium bg-[#FAFAFA] p-3 rounded-lg border border-[#F0EBE1]">{item.description}</p>
                    
                    <Link to={`/menu/${item.id}`} className="inline-flex items-center gap-2 md:gap-3 text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A] hover:text-[#6A7B53] transition-colors">
                      Mở chi tiết
                      <div className="w-6 md:w-8 h-px bg-[#1A1A1A] group-hover:bg-[#6A7B53] transition-colors"></div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Signature Section */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-[#1C2B1C] border-y-[6px] border-[#6A7B53]">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]"></div>
        <div className="mx-auto max-w-5xl text-center px-4 md:px-6 relative z-10 zoom-in">
          <h3 className="font-display text-4xl md:text-6xl lg:text-7xl text-[#FDFBF7] mb-12 md:mb-20 leading-[1.3] italic font-medium [text-shadow:0_5px_15px_rgba(0,0,0,0.4)]">
            "Sợi bún mềm, miếng chả thơm <br /> <span className="custom-accent-text block mt-3 md:mt-4 font-bold">Thảo thơm tình mẹ</span>"
          </h3>
          
          <div className="w-1 md:w-1.5 h-16 md:h-24 bg-gradient-to-b from-[#6A7B53] to-transparent mx-auto rounded-full"></div>
          
          <p className="text-[#B8860B] text-[10px] md:text-xs uppercase tracking-[0.4em] mt-10 md:mt-16 font-extrabold max-w-xs mx-auto md:max-w-none">
            Gửi gắm quê hương qua từng thớ thịt nướng.
          </p>
          
          <div className="mt-12 md:mt-16">
            <Link to="/checkout" className="inline-block px-10 md:px-14 py-4 md:py-6 bg-transparent border-2 border-[#6A7B53] text-[#FDFBF7] text-[10px] md:text-sm uppercase tracking-[0.3em] font-bold hover:bg-[#6A7B53] transition-all duration-500 rounded">
              Lên Mẹt Món Mới
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

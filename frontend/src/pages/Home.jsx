import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../lib/api.js";
import { formatPriceVND } from "../utils/price.js";

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
    <div className="bg-[#FDF5E6] min-h-screen text-[#3E2723] font-sans selection:bg-[#C84B31] selection:text-white overflow-hidden relative z-10">
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
            background: linear-gradient(to right, #D97706, #C84B31);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0px 4px 20px rgba(200, 75, 49, 0.2);
          }
          .cinematic-hero-home {
            background-image: url('/images/z7699819298138_5ea6bacf9d760fe5a02bd43fc7c1569b.jpg');
            background-attachment: fixed;
            background-size: cover;
            background-position: center;
          }
          .float-animation {
            animation: float 6s ease-in-out infinite;
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          .warm-glow {
            box-shadow: 0 0 40px rgba(200, 75, 49, 0.15);
          }
        `}
      </style>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 cinematic-hero-home scale-110 filter brightness-[0.7] sepia-[0.3] contrast-125 transition-transform duration-[10s] hover:scale-105"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#2E1503]/50 via-[#2E1503]/20 to-[#FDF5E6]"></div>
        
        <div className="relative z-10 text-center px-4 mt-20 max-w-5xl mx-auto w-full">
          <div className="slide-up float-animation" style={{ transitionDelay: '100ms' }}>
            <span className="inline-block px-6 md:px-8 py-2.5 md:py-3 border border-[#FDF5E6]/40 text-[9px] md:text-sm uppercase tracking-[0.4em] font-bold text-[#FDF5E6] mb-6 md:mb-8 bg-[#2E1503]/40 backdrop-blur-md shadow-lg rounded-sm ring-1 ring-[#D97706]/30">
              Tinh Hoa Ẩm Thực Đồng Quê
            </span>
          </div>
          
          <h2 className="font-display text-5xl md:text-8xl lg:text-9xl text-white mb-6 md:mb-10 tracking-wide leading-[1.1] slide-up drop-shadow-2xl" style={{ transitionDelay: '300ms' }}>
            Hương Vị <br /> <span className="custom-accent-text italic pr-2 md:pr-4">Tình Quê</span>
          </h2>
          
          <p className="text-[#FDF5E6]/95 text-sm md:text-xl max-w-2xl mx-auto mb-10 md:mb-16 leading-relaxed tracking-widest uppercase slide-up font-semibold drop-shadow-md px-4" style={{ transitionDelay: '500ms' }}>
            Bếp than hồng đượm lửa, hương chả nướng vấn vương nhịp sống bình dị chốn quê nhà.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 md:gap-8 justify-center items-center slide-up" style={{ transitionDelay: '700ms' }}>
            <Link className="px-10 md:px-12 py-4 md:py-5 bg-gradient-to-r from-[#C84B31] to-[#A03520] text-[#FDF5E6] text-[10px] md:text-sm uppercase tracking-[0.3em] font-bold hover:shadow-[0_10px_40px_rgba(200,75,49,0.5)] transition-all duration-500 hover:-translate-y-2 rounded-md ring-2 ring-[#C84B31]/50 ring-offset-2 ring-offset-[#FDF5E6]/10" to="/menu">
              Khám phá thực đơn
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 md:py-40 px-6 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
        <div className="absolute left-[-10%] top-[20%] w-[40%] h-[60%] bg-[radial-gradient(ellipse_at_center,rgba(200,75,49,0.06)_0%,transparent_70%)] blur-2xl pointer-events-none"></div>
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 items-center gap-16 md:gap-24 relative z-10">
          <div className="space-y-8 md:space-y-12 slide-left">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-12 md:w-20 h-0.5 md:h-1 bg-[#C84B31]"></div>
              <span className="text-[10px] md:text-base uppercase tracking-[0.4em] text-[#C84B31] font-extrabold flex items-center gap-2">
                Hồn Quê Mộc Mạc
              </span>
            </div>
            
            <h3 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.2] text-[#3E2723] font-bold">
              Bắt đầu từ một <br /> <span className="italic custom-accent-text">Bếp Than Hoa</span>
            </h3>
            
            <p className="text-sm md:text-lg text-[#3E2723]/80 leading-loose md:leading-[2.2] max-w-xl font-medium">
              Chinh Hương khởi nguồn từ một nếp nhà nhỏ ở làng quê, nơi mùi chả nướng lẫn vào khói lam chiều lan tỏa khắp xóm. Chúng tôi trân trọng và đặt hồn mình vào từng cách thái thịt, ướp gia vị truyền thống, giữ vẹn nguyên cái chân chất, ấm áp của ẩm thực quê nhà.
            </p>
            
            <div className="pt-4 md:pt-6">
              <Link to="/about" className="group inline-flex items-center gap-3 md:gap-4 text-[10px] md:text-sm uppercase tracking-[0.3em] font-bold text-[#3E2723] transition-colors hover:text-[#C84B31]">
                <span className="border-b-2 border-[#C84B31] pb-1.5 md:pb-2 group-hover:border-[#3E2723] transition-colors">Đọc câu chuyện</span>
                <svg className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-3 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="relative slide-right">
            <div className="absolute -inset-4 md:-inset-6 border-2 border-[#D97706]/20 translate-x-4 md:translate-x-6 -translate-y-4 md:-translate-y-6 z-0 rounded-tl-[100px] rounded-br-[100px]"></div>
            <div className="aspect-[4/5] overflow-hidden relative z-10 shadow-2xl rounded-tl-[80px] rounded-br-[80px] bg-[#FFFDF8] border border-[#E8D8C8] p-3 warm-glow">
               <div className="w-full h-full overflow-hidden rounded-tl-[70px] rounded-br-[70px]">
                 <img 
                  src="/images/z7699827552354_755b5c69c8b1297ef9a1201caf3b50cc.jpg" 
                  alt="Brand Story" 
                  className="w-full h-full object-cover transition-transform duration-[3000ms] hover:scale-110 filter brightness-[0.9] sepia-[0.3] contrast-[1.1]"
                 />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Journey - Media Strip */}
      <section className="py-24 md:py-32 bg-[#FAF3E8] border-y border-[#E8D8C8] relative shadow-[inset_0_0_100px_rgba(200,75,49,0.03)]">
        <div className="mx-auto max-w-7xl px-4 md:px-6 mb-16 md:mb-20 slide-up">
          <div className="text-center space-y-4 md:space-y-6">
            <span className="text-[10px] md:text-sm uppercase tracking-[0.5em] text-[#D97706] font-extrabold block">Bức Tranh Thu Hoạch</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-[#3E2723] font-bold">Nghệ Thuật Ẩm Thực</h2>
            <div className="w-[2px] h-16 md:h-24 bg-gradient-to-b from-[#C84B31] to-transparent mx-auto mt-6 md:mt-10"></div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 px-4 md:px-6 h-auto md:h-[600px] zoom-in max-w-[1400px] mx-auto">
          <div className="flex-[1] overflow-hidden group relative min-h-[250px] md:min-h-[300px] rounded-[2rem] shadow-lg border border-[#E8D8C8]">
            <img src="/images/z7699820424452_f8d7ab08e70eeb92e0f51c7d1a7c1b76.jpg" className="w-full h-full object-cover transition-all duration-[2000ms] group-hover:scale-[1.15] filter sepia-[0.25]" alt="Grilled Pork" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2E1503]/90 via-[#2E1503]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
              <span className="text-[#FDF5E6] font-display text-2xl font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Thịt Nướng Xèo Xèo</span>
            </div>
          </div>
          <div className="flex-[1] overflow-hidden group relative min-h-[250px] md:min-h-[300px] rounded-[2rem] shadow-lg border border-[#E8D8C8]">
            <img src="/images/z7699819283762_3634071596ff124321b8dd68e057bc54.jpg" className="w-full h-full object-cover transition-all duration-[2000ms] group-hover:scale-[1.15] filter sepia-[0.25]" alt="Noodles" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2E1503]/90 via-[#2E1503]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
              <span className="text-[#FDF5E6] font-display text-2xl font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Bún Gạo dẻo thơm</span>
            </div>
          </div>
          <div className="flex-[1.5] overflow-hidden group relative min-h-[250px] md:min-h-[300px] rounded-[2rem] shadow-lg border border-[#E8D8C8]">
            <img src="/images/z7699818623770_8a62f4a85b03b59c3ced823381b7ec55.jpg" className="w-full h-full object-cover transition-all duration-[2000ms] group-hover:scale-[1.15] filter sepia-[0.25]" alt="Nem" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2E1503]/90 via-[#2E1503]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
              <span className="text-[#FDF5E6] font-display text-2xl font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Nem Rán Giòn Rụm</span>
            </div>
          </div>
        </div>
      </section>

      {/* Highlighted Menu */}
      <section className="py-24 md:py-40 px-4 md:px-6 relative bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]">
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-6 md:gap-8 slide-right">
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-4 md:gap-6">
                <span className="w-10 md:w-16 h-0.5 md:h-1 bg-[#C84B31]"></span>
                <span className="text-[10px] md:text-sm uppercase tracking-[0.4em] text-[#C84B31] font-extrabold flex items-center gap-2">
                  Từ mảnh vườn nhỏ
                </span>
              </div>
              <h3 className="font-display text-4xl md:text-6xl lg:text-7xl text-[#3E2723] font-bold">Món Quê Chuẩn Vị</h3>
            </div>
            <Link to="/menu" className="text-[10px] md:text-sm uppercase tracking-[0.3em] font-extrabold text-[#C84B31]/80 border-b-2 border-[#C84B31]/30 pb-2 hover:text-[#C84B31] hover:border-[#C84B31] transition-all duration-300 flex items-center gap-2 group">
              Xem mẹt thực đơn
              <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>

          {loadingHighlights ? (
            <p className="text-center py-20 text-[#3E2723]/50 italic font-semibold text-sm">Đang ủ than hoa...</p>
          ) : highlights.length === 0 ? (
            <p className="text-center py-20 text-[#3E2723]/50 italic font-semibold text-sm">Chưa có món mới. Bạn đợi một chút nhé...</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-12 gap-y-12 md:gap-y-20">
              {highlights.map((item, idx) => (
                <div key={item.id} className="group relative slide-up bg-[#FFFDF8] rounded-3xl shadow-xl border border-[#E8D8C8] overflow-hidden hover:shadow-[0_20px_50px_rgba(200,75,49,0.12)] transition-all duration-500 hover:-translate-y-2" style={{ transitionDelay: `${(idx * 150) % 600}ms` }}>
                  <div className="aspect-[4/3] overflow-hidden relative bg-[#FDF5E6] rounded-t-3xl">
                    <img 
                      src={item.imageUrl || "/images/z7699818644305_2d4593c168855b379e693ea8a463137d.jpg"} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110 filter sepia-[0.25] contrast-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2E1503]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4">
                       <span className="text-[9px] uppercase tracking-[0.3em] text-[#FDF5E6] font-extrabold bg-gradient-to-r from-[#C84B31] to-[#D97706] px-4 py-2 rounded-full shadow-md">{item.tag}</span>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 relative">
                    <div className="absolute right-6 -top-6 w-14 h-14 bg-[#FFFDF8] rounded-full flex items-center justify-center font-bold text-[#C84B31] border-2 shadow-lg border-[#E8D8C8] group-hover:bg-[#C84B31] group-hover:text-white transition-all duration-500 transform group-hover:rotate-90 group-hover:scale-110">
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    
                    <h4 className="font-display text-2xl md:text-3xl mb-3 text-[#3E2723] font-bold group-hover:text-[#C84B31] transition-colors">{item.name}</h4>
                    <p className="text-[#D97706] font-extrabold text-xl mb-4">{formatPriceVND(item.price)}</p>
                    <p className="text-[11px] md:text-sm text-[#3E2723]/70 leading-relaxed mb-6 md:mb-8 line-clamp-2 md:line-clamp-3 font-medium bg-[#FAF3E8] p-4 rounded-xl border border-[#E8D8C8]/60 shadow-inner">{item.description}</p>
                    
                    <Link to={`/menu/${item.id}`} className="inline-flex items-center gap-2 md:gap-3 text-[10px] uppercase tracking-[0.2em] font-bold text-[#3E2723] hover:text-[#C84B31] transition-colors">
                      Thưởng Thức Ngay
                      <div className="w-6 md:w-10 h-0.5 bg-[#3E2723] group-hover:bg-[#C84B31] transition-colors"></div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Signature Section */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-[#2D1A11] border-y-[8px] border-[#C84B31]">
        <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[#2E1503] mix-blend-color-burn"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-[radial-gradient(ellipse_at_top,rgba(200,75,49,0.3)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="mx-auto max-w-5xl text-center px-4 md:px-6 relative z-10 zoom-in">
          
          <h3 className="font-display text-4xl md:text-6xl lg:text-7xl text-[#FDF5E6] mb-12 md:mb-16 leading-[1.3] italic font-medium drop-shadow-2xl">
            "Sợi bún mềm, miếng chả thơm <br /> <span className="text-[#D97706] block mt-4 md:mt-6 font-bold not-italic font-sans text-5xl md:text-8xl">Thảo Thơm Tình Mẹ</span>"
          </h3>
          
          <div className="w-1.5 md:w-2 h-16 md:h-24 bg-gradient-to-b from-[#C84B31] via-[#D97706] to-transparent mx-auto rounded-full"></div>
          
          <p className="text-[#C84B31] text-[10px] md:text-xs uppercase tracking-[0.5em] mt-10 md:mt-12 font-extrabold max-w-xs mx-auto md:max-w-none flex items-center justify-center gap-4">
            <span className="w-8 h-px bg-[#C84B31]"></span>
            Gửi gắm quê hương qua từng thớ thịt nướng
            <span className="w-8 h-px bg-[#C84B31]"></span>
          </p>
          
          <div className="mt-14 md:mt-20">
            <Link to="/checkout" className="inline-block px-12 md:px-16 py-5 md:py-6 bg-[#C84B31] text-[#FDF5E6] text-[10px] md:text-sm uppercase tracking-[0.4em] font-bold hover:bg-[#A03520] transition-all duration-500 rounded-lg shadow-[0_15px_40px_rgba(200,75,49,0.4)] hover:shadow-[0_20px_50px_rgba(200,75,49,0.6)] hover:-translate-y-2 ring-4 ring-[#C84B31]/30 ring-offset-4 ring-offset-[#2D1A11]">
              Lên Mẹt Món Mới
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

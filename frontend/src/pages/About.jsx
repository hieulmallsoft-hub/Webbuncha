import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function About() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const timer = setTimeout(() => {
      document.querySelectorAll(".reveal-element").forEach((el) => observer.observe(el));
      document.querySelectorAll(".hero-reveal").forEach((el) => el.classList.add("is-visible"));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-[#FDF5E6] min-h-screen text-[#3E2723] font-sans selection:bg-[#C84B31] selection:text-white overflow-hidden relative pb-24 md:pb-40">
      <style>
        {`
          .reveal-element, .hero-reveal {
            opacity: 0;
            transform: translateY(40px);
            transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .reveal-element.is-visible, .hero-reveal.is-visible {
            opacity: 1;
            transform: translateY(0);
          }
          .rice-paper-overlay {
            background-image: url('https://www.transparenttextures.com/patterns/rice-paper-2.png');
            opacity: 0.4;
          }
          .bamboo-line {
            width: 3px;
            background: linear-gradient(to bottom, transparent, #C84B31, transparent);
            border-radius: 4px;
          }
        `}
      </style>

      {/* Cinematic Banner Section */}
      <div className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden flex items-center justify-center border-b-[8px] border-[#C84B31]">
        <div 
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.6] sepia-[0.35] contrast-[1.1] transition-transform duration-[15s] hover:scale-110"
          style={{ backgroundImage: "url('/images/z7699827552354_755b5c69c8b1297ef9a1201caf3b50cc.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#2E1503]/50 via-transparent to-[#FDF5E6]"></div>
        
        <div className="relative z-10 text-center px-4 mt-20 md:mt-32">
          <div className="hero-reveal" style={{ transitionDelay: '100ms' }}>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.6em] text-[#FDF5E6]/90 font-black mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              Hành Trình Tình Quê
            </p>
          </div>
          <h1 className="hero-reveal font-display text-5xl md:text-8xl lg:text-9xl text-[#FDF5E6] font-bold drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] mb-8" style={{ transitionDelay: '300ms' }}>
            CÂU CHUYỆN <br/>
            <span className="italic font-black text-[#D97706] tracking-widest text-3xl md:text-6xl mt-4 block text-shadow-xl drop-shadow-md">Nếp Nhà</span>
          </h1>
          <div className="hero-reveal w-20 h-1.5 bg-gradient-to-r from-transparent via-[#C84B31] to-transparent mx-auto rounded-full" style={{ transitionDelay: '500ms' }}></div>
        </div>
      </div>

      {/* Main Story Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-16 md:mt-24 grid md:grid-cols-2 gap-12 md:gap-24 items-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-10 pointer-events-none"></div>
        <div className="reveal-element space-y-8 md:space-y-12 relative z-10">
          <div className="flex items-center gap-6">
            <span className="w-20 h-1 rounded-full bg-[#C84B31]"></span>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#C84B31] font-extrabold drop-shadow-sm">Từ Gác Trọ Sơn Cước</span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl text-[#3E2723] leading-tight font-black drop-shadow-sm">
            Gói Trọn <br/> <span className="text-[#D97706] italic font-bold">Hồn Đất Khách</span>
          </h2>
          <div className="space-y-6 md:space-y-8 text-[#3E2723]/80 leading-[2] md:leading-[2.2] text-sm md:text-lg font-semibold">
            <p>
              Vào cuối những năm 90, giữa nhịp sống bình lặng của mảnh đất Bỉm Sơn, quán nhỏ Bún Chả Chinh Hương đã được thắp lửa từ sự tỉ mẩn và tâm lòng của người mẹ hiền. Không cầu kỳ, không xa hoa, nếp nhà ấy giữ chân khách xa gần bằng mùi khói than hoa nồng đượm len lỏi khắp xóm làng.
            </p>
            <p className="bg-[#FAF3E8] p-4 rounded-xl border border-[#E8D8C8] shadow-inner mb-4">
              Mỗi mẹt bún dâng lên là sự kết tinh của những thớ thịt tươi ngon tuyển lựa, những sợi bún trắng trong mượt mà và bát nước chấm đậm đà, óng ánh sắc màu của dưa góp.
            </p>
          </div>
          <div className="p-8 bg-[#FAF3E8] border-l-8 border-[#C84B31] rounded-r-3xl shadow-[0_10px_20px_rgba(200,75,49,0.05)]">
             <p className="text-[#3E2723]/70 italic font-black text-xs md:text-base leading-relaxed uppercase tracking-wider drop-shadow-sm">
              "Chúng tôi không chỉ mời bạn thưởng thức món ăn, chúng tôi kể bạn nghe về sự mộc mạc và nghĩa tình nồng ấm của đất Việt qua từng hương vị nướng than mộc."
             </p>
          </div>
        </div>

        <div className="reveal-element relative z-10">
           <div className="relative group">
              <div className="absolute -inset-4 md:-inset-8 border-2 border-[#D97706]/40 rounded-[2rem] translate-x-4 md:translate-x-8 -translate-y-4 md:-translate-y-8 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-1000 bg-[#FAF3E8] shadow-[0_20px_40px_rgba(217,119,6,0.1)]"></div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] shadow-2xl border-[6px] border-[#FFFDF8]">
                <div className="absolute inset-0 bg-[#A03520] opacity-[0.05] group-hover:opacity-0 transition-opacity z-10 pointer-events-none"></div>
                <img 
                  src="/images/z7699818644305_2d4593c168855b379e693ea8a463137d.jpg" 
                  className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110 filter brightness-[0.9] sepia-[0.25] contrast-[1.1]" 
                  alt="Traditional Bún Chả Nướng Than" 
                />
              </div>
           </div>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-32 md:mt-48 text-center bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] bg-[#FFFDF8] py-24 rounded-[3rem] shadow-[0_20px_60px_rgba(200,75,49,0.08)] border-2 border-[#E8D8C8]">
        <div className="reveal-element max-w-4xl mx-auto px-4">
          <span className="text-[#C84B31] uppercase tracking-[0.6em] text-[10px] md:text-xs font-black block mb-10 flex flex-col items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping"></span>
            Triết Lý Bếp Hồng
          </span>
          <h3 className="font-display text-4xl md:text-6xl lg:text-7xl text-[#3E2723] mb-14 font-black leading-tight drop-shadow-md">
            "Khi lửa đỏ than hồng hừng hực, cũng là lúc cái tình người Bỉm Sơn được gửi vào từng thớ thịt."
          </h3>
          <div className="flex gap-6 justify-center items-center mb-20 text-3xl md:text-4xl">
             <div className="w-16 h-1 rounded-full bg-gradient-to-r from-transparent to-[#D97706]/60"></div>
             <span className="text-[#C84B31] filter drop-shadow-sm">🔥</span>
             <span className="text-[#D97706] filter drop-shadow-sm">🥢</span>
             <div className="w-16 h-1 rounded-full bg-gradient-to-l from-transparent to-[#D97706]/60"></div>
          </div>
          <Link to="/menu" className="inline-block px-12 md:px-16 py-5 md:py-6 bg-gradient-to-r from-[#C84B31] to-[#A03520] text-[#FDF5E6] text-[10px] md:text-xs uppercase tracking-[0.4em] font-black hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(200,75,49,0.4)] transition-all duration-500 rounded-xl ring-2 ring-[#C84B31]/30 ring-offset-4 ring-offset-[#FFFDF8]">
            Lật Giở Thực Đơn
          </Link>
        </div>
      </div>

      {/* Bamboo/Wood Section Visual Spacer */}
      <div className="mt-24 md:mt-40 reveal-element flex justify-center">
         <div className="bamboo-line h-48 md:h-72"></div>
      </div>
    </div>
  );
}

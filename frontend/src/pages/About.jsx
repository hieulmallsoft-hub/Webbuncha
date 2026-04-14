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
    <div className="bg-[#FDFBF7] min-h-screen text-[#1A1A1A] font-sans selection:bg-[#6A7B53] selection:text-white overflow-hidden relative pb-24 md:pb-40">
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
            width: 2px;
            background: linear-gradient(to bottom, transparent, #6A7B53, transparent);
          }
        `}
      </style>

      {/* Cinematic Banner Section */}
      <div className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.6] sepia-[0.2]"
          style={{ backgroundImage: "url('/images/z7699827552354_755b5c69c8b1297ef9a1201caf3b50cc.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#FDFBF7]"></div>
        
        <div className="relative z-10 text-center px-4 mt-20 md:mt-32">
          <div className="hero-reveal" style={{ transitionDelay: '100ms' }}>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.6em] text-white/90 font-bold mb-6 drop-shadow-md">
              Hành Trình Di Sản
            </p>
          </div>
          <h1 className="hero-reveal font-display text-5xl md:text-8xl lg:text-9xl text-white font-bold drop-shadow-2xl mb-8" style={{ transitionDelay: '300ms' }}>
            CÂU CHUYỆN <br/>
            <span className="italic font-medium text-[#D4AF37] tracking-widest text-3xl md:text-6xl mt-4 block">Quê Nhà</span>
          </h1>
          <div className="hero-reveal w-1.5 h-16 md:h-24 bg-[#6A7B53] mx-auto rounded-full" style={{ transitionDelay: '500ms' }}></div>
        </div>
      </div>

      {/* Main Story Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-16 md:mt-24 grid md:grid-cols-2 gap-12 md:gap-24 items-center">
        <div className="reveal-element space-y-8 md:space-y-12">
          <div className="flex items-center gap-6">
            <span className="w-16 h-0.5 bg-[#6A7B53]"></span>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#6A7B53] font-bold">Từ Nếp Nhà Xưa</span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl text-[#1A1A1A] leading-tight font-bold">
            Gói Trọn <br/> <span className="text-[#B8860B] italic font-medium">Hồn Đất Khách</span>
          </h2>
          <div className="space-y-6 md:space-y-8 text-[#1A1A1A]/70 leading-[2] md:leading-[2.2] text-sm md:text-lg font-medium">
            <p>
              Vào cuối những năm 90, giữa nhịp sống bình lặng của mảnh đất Bỉm Sơn, quán nhỏ Bún Chả Chinh Hương đã được thắp lửa từ sự tỉ mẩn và tâm lòng của người mẹ hiền. Không cầu kỳ, không xa hoa, nếp nhà ấy giữ chân khách xa gần bằng mùi khói than hoa nồng đượm len lỏi khắp xóm làng.
            </p>
            <p>
              Mỗi mẹt bún dâng lên là sự kết tinh của những thớ thịt tươi ngon tuyển lựa, những sợi bún trắng trong mượt mà và bát nước chấm đậm đà, óng ánh sắc màu của dưa góp.
            </p>
          </div>
          <div className="p-6 bg-[#6A7B53]/5 border-l-4 border-[#6A7B53] rounded-r-2xl">
             <p className="text-[#1A1A1A]/60 italic font-semibold text-xs md:text-base leading-relaxed uppercase tracking-wider">
              "Chúng tôi không chỉ bán món ăn, chúng tôi kể về sự chân chất và tình nồng nàn của đất Việt qua từng hương vị nướng than."
             </p>
          </div>
        </div>

        <div className="reveal-element">
           <div className="relative group">
              <div className="absolute -inset-4 md:-inset-8 border border-[#6A7B53]/20 rounded-3xl translate-x-4 md:translate-x-8 -translate-y-4 md:-translate-y-8 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-1000"></div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl border-4 border-white">
                <img 
                  src="/images/z7699818644305_2d4593c168855b379e693ea8a463137d.jpg" 
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 filter brightness-[0.95] sepia-[0.1]" 
                  alt="Traditional Bún Chả" 
                />
              </div>
           </div>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-32 md:mt-48 text-center bg-white py-20 rounded-3xl shadow-[0_15px_45px_rgba(0,0,0,0.03)] border border-[#F0EBE1]">
        <div className="reveal-element max-w-3xl mx-auto">
          <span className="text-[#6A7B53] uppercase tracking-[0.5em] text-[10px] md:text-xs font-bold block mb-8">Triết Lý Ẩm Thực</span>
          <h3 className="font-display text-3xl md:text-5xl lg:text-6xl text-[#1A1A1A] mb-12 font-bold leading-tight">
            "Khi lửa đỏ than hồng hừng hực, cũng là lúc cái tình người Bỉm Sơn được gửi vào từng thớ thịt."
          </h3>
          <div className="flex gap-4 justify-center items-center mb-16">
             <div className="w-12 h-0.5 bg-[#B8860B]/30"></div>
             <span className="text-[#B8860B] text-xl">🎋</span>
             <div className="w-12 h-0.5 bg-[#B8860B]/30"></div>
          </div>
          <Link to="/menu" className="inline-block px-10 md:px-14 py-4 md:py-5 bg-[#6A7B53] text-white text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold hover:bg-[#1C2B1C] transition-all duration-500 shadow-xl rounded">
            Thực Đơn Di Sản
          </Link>
        </div>
      </div>

      {/* Bamboo Section Visual Spacer */}
      <div className="mt-24 md:mt-40 reveal-element flex justify-center">
         <div className="bamboo-line h-40 md:h-64"></div>
      </div>
    </div>
  );
}

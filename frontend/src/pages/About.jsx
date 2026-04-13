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
    
    // Slight delay to ensure React commits DOM
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
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-gold selection:text-black overflow-hidden relative pb-40">
      <style>
        {`
          .reveal-element, .hero-reveal {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
            filter: blur(10px);
            transition: all 1.5s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .reveal-element.is-visible, .hero-reveal.is-visible {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
          .glow-text {
            text-shadow: 0 0 40px rgba(212, 175, 55, 0.4), 0 0 100px rgba(212, 175, 55, 0.2);
          }
          .trippy-overlay {
            background: linear-gradient(135deg, rgba(20,20,20,0.4) 0%, rgba(5,5,5,0.7) 100%);
          }
          .parallax-layer {
            animation: floating 25s ease-in-out infinite alternate;
          }
          @keyframes floating {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-20px, 30px) scale(1.05); }
            100% { transform: translate(20px, -20px) scale(1); }
          }
        `}
      </style>

      {/* Cinematic Background Video Section */}
      <div className="absolute inset-0 z-0 h-[100vh] w-full overflow-hidden bg-[#050505] pointer-events-none">
        <iframe
          className="absolute top-1/2 left-1/2 w-[300vw] h-[300vh] md:w-[150vw] md:h-[150vh] -translate-x-1/2 -translate-y-1/2 opacity-50 filter contrast-150 saturate-150"
          src="https://www.youtube.com/embed/L_LUpnjgPso?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=L_LUpnjgPso&modestbranding=1&playsinline=1&iv_load_policy=3"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          title="Background fire"
        ></iframe>
        <div className="absolute inset-0 trippy-overlay"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#050505] to-transparent"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32">
        <div className="hero-reveal" style={{ transitionDelay: '100ms' }}>
          <div className="w-px h-24 bg-gradient-to-b from-transparent to-gold mx-auto mb-8"></div>
          <p className="text-[10px] md:text-xs uppercase tracking-[0.8em] text-gold font-bold mb-6">
            The Philosophy of Flames
          </p>
        </div>
        
        <h1 className="hero-reveal font-display text-5xl md:text-8xl lg:text-[10rem] leading-none tracking-tight text-white glow-text mb-8" style={{ transitionDelay: '400ms' }}>
          BẢN LĨNH <br/>
          <span className="italic font-light text-gold tracking-widest text-4xl md:text-7xl lg:text-8xl mt-4 block">Ngọn Lửa</span>
        </h1>
        
        <p className="hero-reveal max-w-2xl text-sm md:text-base text-gray-300 uppercase tracking-widest leading-loose font-medium px-4" style={{ transitionDelay: '700ms' }}>
          Tuyệt tác ẩm thực được thăng hoa từ những bếp than hồng rực đỏ giữa lòng phố cổ truyền thống. Chúng tôi khơi dậy hương vị nguyên bản bằng ngọn lửa của sự đam mê.
        </p>

        <div className="hero-reveal mt-20" style={{ transitionDelay: '1000ms' }}>
          <div className="flex animate-bounce">
            <div className="w-0.5 h-16 bg-white/30 hidden md:block"></div>
          </div>
        </div>
      </div>

      {/* Story Secton */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-32 grid md:grid-cols-2 gap-20 items-center">
        <div className="reveal-element space-y-10">
          <h2 className="font-display text-4xl md:text-6xl text-white leading-tight">
            Nghệ Thuật <br/> <span className="text-gold italic">Thời Gian</span>
          </h2>
          <div className="w-16 h-px bg-gold"></div>
          <p className="text-gray-300 leading-loose text-lg font-light break-words">
            Năm 1992, giữa những con hẻm chật hẹp nồng nặc khói nướng, Bún Chả Chinh Hương ra đời không chỉ với tư cách là một quán ăn, mà là một trải nghiệm đánh thức các giác quan. 
            Mỗi miếng thịt nướng là một bức tranh, một vũ điệu giữa lửa và nước mắm cốt gia truyền.
          </p>
          <p className="text-gray-400 leading-loose text-sm uppercase tracking-widest font-bold">
            "Sự hoàn hảo không đến từ công thức phức tạp, mà từ sự tận tâm trong từng công đoạn."
          </p>
        </div>
        <div className="reveal-element block">
           <div className="relative p-4 md:p-10 border border-white/10 rounded-full aspect-square flex items-center justify-center bg-black/20 backdrop-blur-3xl shadow-[0_0_100px_rgba(212,175,55,0.1)]">
             <img src="/images/z7699827552354_755b5c69c8b1297ef9a1201caf3b50cc.jpg" className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-1000 hover:scale-105" alt="Story" />
           </div>
        </div>
      </div>

       {/* Manifest Secton */}
       <div className="relative z-10 max-w-5xl mx-auto px-6 mt-40 text-center">
        <div className="reveal-element bg-gradient-to-b from-white/5 to-transparent p-12 md:p-24 rounded-3xl border border-white/5 backdrop-blur-xl">
          <span className="text-gold uppercase tracking-[0.5em] text-xs font-extrabold block mb-8">Manifesto</span>
          <h3 className="font-display text-4xl md:text-5xl text-white mb-12">
            "Không chỉ là món ăn, đó là toàn bộ di sản văn hóa tinh túy 500 năm."
          </h3>
          <Link to="/menu" className="inline-block px-12 py-5 bg-transparent border border-gold text-gold text-xs uppercase tracking-[0.3em] font-extrabold hover:bg-gold hover:text-black transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:shadow-[0_0_60px_rgba(212,175,55,0.4)]">
            Thưởng Thức Di Sản
          </Link>
        </div>
      </div>

    </div>
  );
}

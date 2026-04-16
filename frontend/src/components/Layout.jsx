import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearToken, getToken } from "../lib/auth.js";
import { useCart } from "../context/CartContext.jsx";
import ToastContainer from "./ToastContainer.jsx";

const navItems = [
  { to: "/", label: "Trang chủ" },
  { to: "/menu", label: "Thực đơn" },
  { to: "/about", label: "Câu Chuyện" },
  { to: "/reviews", label: "Bình luận" }
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { items } = useCart();
  const token = getToken();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#FDF5E6] text-[#3E2723] relative font-sans">
      <style>
        {`
          @keyframes bambooSway {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(3deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes bambooSwayOpposite {
            0% { transform: scaleX(-1) rotate(0deg); }
            50% { transform: scaleX(-1) rotate(3deg); }
            100% { transform: scaleX(-1) rotate(0deg); }
          }
          .bamboo-container {
            position: fixed;
            top: 0;
            bottom: 0;
            width: 180px;
            pointer-events: none;
            z-index: 100;
            opacity: 0.2;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .bamboo-left {
            left: -20px;
            transform-origin: bottom center;
            animation: bambooSway 10s ease-in-out infinite;
          }
          .bamboo-right {
            right: -20px;
            transform-origin: bottom center;
            animation: bambooSwayOpposite 12s ease-in-out infinite;
          }
          @media (max-width: 1024px) {
            .bamboo-container { width: 100px; opacity: 0.15; }
          }
        `}
      </style>

      {/* Bamboo Decorations Left */}
      <div className="bamboo-container bamboo-left">
         <svg viewBox="0 0 100 800" fill="#A67B5B" xmlns="http://www.w3.org/2000/svg">
            {/* Trunk 1 */}
            <path d="M30,800 L35,800 Q40,400 35,0 L30,0 Q35,400 30,800 Z" opacity="0.8" />
            <path d="M35,100 Q60,95 80,70 Q60,90 35,105 Z" />
            <path d="M35,250 Q75,240 95,210 Q75,235 35,255 Z" />
            <path d="M35,450 Q65,445 85,420 Q65,440 35,460 Z" />
            <path d="M35,650 Q80,640 100,610 Q80,635 35,660 Z" />
            {/* Trunk 2 */}
            <path d="M10,800 L14,800 Q18,400 14,0 L10,0 Q14,400 10,800 Z" opacity="0.6" />
            <path d="M14,180 Q40,175 55,150 Q40,170 14,185 Z" />
            <path d="M14,380 Q45,370 60,340 Q45,365 14,385 Z" />
            <path d="M14,580 Q40,575 55,550 Q40,570 14,585 Z" />
         </svg>
      </div>

      {/* Bamboo Decorations Right */}
      <div className="bamboo-container bamboo-right">
         <svg viewBox="0 0 100 800" fill="#A67B5B" xmlns="http://www.w3.org/2000/svg">
            {/* Trunk 1 */}
            <path d="M30,800 L35,800 Q40,400 35,0 L30,0 Q35,400 30,800 Z" opacity="0.8" />
            <path d="M35,100 Q60,95 80,70 Q60,90 35,105 Z" />
            <path d="M35,250 Q75,240 95,210 Q75,235 35,255 Z" />
            <path d="M35,450 Q65,445 85,420 Q65,440 35,460 Z" />
            <path d="M35,650 Q80,640 100,610 Q80,635 35,660 Z" />
            {/* Trunk 2 */}
            <path d="M10,800 L14,800 Q18,400 14,0 L10,0 Q14,400 10,800 Z" opacity="0.6" />
            <path d="M14,180 Q40,175 55,150 Q40,170 14,185 Z" />
            <path d="M14,380 Q45,370 60,340 Q45,365 14,385 Z" />
            <path d="M14,580 Q40,575 55,550 Q40,570 14,585 Z" />
         </svg>
      </div>

      <header className={`fixed top-0 left-0 right-0 z-[110] transition-all duration-500 border-b ${scrolled ? "bg-[#FFFDF8]/95 backdrop-blur-xl py-3 border-[#E8D8C8] shadow-lg shadow-[#2D1A11]/5" : "bg-gradient-to-b from-black/70 to-transparent border-transparent py-4 md:py-7"}`}>
        <div className="mx-auto max-w-7xl px-4 md:px-8 flex items-center justify-between">
          <Link to="/" className="group z-10">
            <h1 className={`font-display text-xl md:text-3xl tracking-[0.2em] md:tracking-[0.3em] uppercase transition-colors duration-500 ${scrolled ? "text-[#C84B31]" : "text-[#FDF5E6] drop-shadow-md"} group-hover:text-[#D97706]`}>
              Chinh Hương
            </h1>
          </Link>

          <nav className="hidden lg:flex items-center gap-12">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-[11px] uppercase tracking-[0.4em] font-extrabold transition-all duration-300 ${scrolled ? (isActive ? "text-[#C84B31]" : "text-[#3E2723]/60 hover:text-[#C84B31]") : (isActive ? "text-[#D97706] drop-shadow-md" : "text-[#FDF5E6]/80 hover:text-[#D97706]")}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-5 md:gap-10">
            <Link to="/cart" className="relative group flex items-center gap-2">
              <svg className={`w-6 h-6 ${scrolled ? 'text-[#3E2723] group-hover:text-[#C84B31]' : 'text-white group-hover:text-[#D97706]'} transition-colors duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#D97706] text-[9px] text-white font-bold shadow-md animate-pulse">
                  {items.length}
                </span>
              )}
            </Link>

            {token ? (
              <Link to="/account" className={`text-[10px] md:text-[11px] uppercase tracking-[0.3em] border px-5 py-2.5 transition-all duration-500 rounded-sm font-bold ${scrolled ? 'border-[#3E2723]/20 text-[#3E2723] hover:border-[#C84B31] hover:text-[#C84B31]' : 'border-white/30 text-white hover:border-[#D97706] hover:text-[#D97706] hover:bg-white/10'}`}>
                Tài khoản
              </Link>
            ) : (
               <Link to="/login" className={`text-[10px] md:text-[11px] uppercase tracking-[0.3em] ${scrolled ? 'bg-[#C84B31] text-[#FDF5E6] hover:bg-[#A03520]' : 'bg-[#D97706] text-[#2D1A11] hover:bg-[#FDF5E6] hover:text-[#C84B31]'} px-6 md:px-10 py-2.5 font-extrabold transition-all duration-500 rounded-md shadow-md ring-2 ring-transparent hover:ring-offset-2 hover:ring-[#C84B31]/40`}>
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {children}
      </main>

      <footer className="bg-[#2D1A11] text-[#FDF5E6] py-24 relative z-20 overflow-hidden border-t-[10px] border-[#C84B31]">
        {/* Footer decoration overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[#2E1503] mix-blend-color-burn"></div>
        <div className="absolute top-0 right-0 opacity-15 pointer-events-none w-80 h-80 -rotate-12 translate-x-20 -translate-y-20">
           <svg viewBox="0 0 100 800" fill="#C84B31"><path d="M30,800 L35,800 Q40,400 35,0 L30,0 Q35,400 30,800 Z" /><path d="M35,100 Q60,95 80,70 Q60,90 35,105 Z" /><path d="M35,450 Q65,445 85,420 Q65,440 35,460 Z" /></svg>
        </div>

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid gap-20 md:grid-cols-3">
            <div className="space-y-8">
              <h3 className="font-display text-4xl tracking-[0.2em] font-bold text-[#D97706] drop-shadow-lg">CHINH HƯƠNG</h3>
              <p className="text-xs leading-[2.4] text-[#FDF5E6]/70 max-w-xs uppercase tracking-widest font-semibold">
                Đậm tình quê nhà, vấn vương hương vị Bỉm Sơn qua từng thớ thịt đỏ hồng trên bếp than hoa.
              </p>
              <div className="flex gap-4">
                <div className="w-16 h-1 bg-[#C84B31]/60 rounded-full"></div>
                <div className="w-4 h-1 bg-[#D97706]/60 rounded-full"></div>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] uppercase tracking-[0.5em] font-extrabold text-[#FDF5E6]/40 border-b border-[#FDF5E6]/10 pb-4">Liên kết</h4>
              <ul className="space-y-5 text-[10px] uppercase tracking-[0.3em] font-bold">
                <li><Link to="/menu" className="hover:text-[#D97706] transition-all flex items-center gap-2"><span>→</span> Thực đơn</Link></li>
                <li><Link to="/reviews" className="hover:text-[#D97706] transition-all flex items-center gap-2"><span>→</span> Lưu bút</Link></li>
                <li><Link to="/about" className="hover:text-[#D97706] transition-all flex items-center gap-2"><span>→</span> Câu chuyện</Link></li>
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] uppercase tracking-[0.5em] font-extrabold text-[#FDF5E6]/40 border-b border-[#FDF5E6]/10 pb-4">Địa điểm</h4>
              <p className="text-xs text-[#FDF5E6]/80 leading-loose uppercase tracking-[0.15em] font-medium">
                Số 8 Trần Phú, Phường Bỉm Sơn<br />Tỉnh Thanh Hóa, Việt Nam
              </p>
              <div className="pt-2">
                <p className="text-[#D97706] text-3xl font-light tracking-widest">(+84) 945 409 408</p>
                <p className="text-[10px] text-[#FDF5E6]/40 uppercase tracking-widest mt-3">Phục vụ từ 08:00 - 22:00</p>
              </div>
            </div>
          </div>
          
          <div className="mt-24 pt-10 border-t border-[#FDF5E6]/10 flex flex-col md:flex-row justify-between items-center gap-8">
            <span className="text-[9px] uppercase tracking-[0.5em] text-[#FDF5E6]/40 font-bold">&copy; 2026 Bún Chả Chinh Hương. Đầm Ấm Tình Quê.</span>
            <div className="flex gap-10 text-[9px] uppercase tracking-[0.5em] text-[#FDF5E6]/40 font-bold">
              <span className="hover:text-[#D97706] cursor-pointer transition-colors">Bảo mật</span>
              <span className="hover:text-[#D97706] cursor-pointer transition-colors">Điều khoản</span>
            </div>
          </div>
        </div>
      </footer>
      <ToastContainer />
    </div>
  );
}

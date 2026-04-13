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
    <div className="min-h-screen bg-[#1c1917] text-white">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-white/5 ${scrolled ? "bg-[#0a0a0a]/80 backdrop-blur-xl py-3 shadow-2xl" : "bg-gradient-to-b from-black/80 to-transparent py-6"}`}>
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <Link to="/" className="group">
            <h1 className="font-display text-2xl tracking-[0.2em] uppercase text-white group-hover:text-gold transition-colors duration-700">
              Bún Chả Chinh Hương
            </h1>
          </Link>

          <nav className="hidden lg:flex items-center gap-12">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-[10px] uppercase tracking-[0.4em] font-bold transition-all duration-700 ${
                    isActive ? "text-gold" : "text-gray-400 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-8">
            <Link to="/cart" className="relative group flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-300 group-hover:text-gold transition-colors">Giỏ hàng</span>
              {items.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[9px] text-black font-bold">
                  {items.length}
                </span>
              )}
            </Link>

            {token ? (
              <Link to="/account" className="text-[10px] uppercase tracking-[0.3em] border border-white/20 px-6 py-2.5 hover:border-gold hover:text-gold transition-all duration-500">
                Tài khoản
              </Link>
            ) : (
               <Link to="/login" className="text-[10px] uppercase tracking-[0.3em] bg-gold px-8 py-2.5 text-black font-bold hover:bg-white hover:text-black transition-all duration-500">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="">
        {children}
      </main>

      <footer className="bg-midnight text-premium-sand py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-20 md:grid-cols-3">
            <div className="space-y-8">
              <h3 className="font-display text-3xl tracking-widest uppercase text-gold">BCCH</h3>
              <p className="text-xs leading-relaxed text-premium-sand/40 max-w-xs uppercase tracking-widest">
                Symphony of traditional flavors and modern luxury.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-px bg-gold/30"></div>
                <div className="w-8 h-px bg-gold/30"></div>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-premium-sand/30">Navigation</h4>
              <ul className="space-y-4 text-[10px] uppercase tracking-[0.2em]">
                <li><Link to="/menu" className="hover:text-gold transition-colors">Thực đơn</Link></li>
                <li><Link to="/reviews" className="hover:text-gold transition-colors">Bình luận</Link></li>
                <li><Link to="/about" className="hover:text-gold transition-colors">Về chúng tôi</Link></li>
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-premium-sand/30">Address</h4>
              <p className="text-xs text-premium-sand/50 leading-loose uppercase tracking-[0.1em]">
                Số 8 Trần Phú, Phường Bỉm Sơn<br />Tỉnh Thanh Hóa, Việt Nam
              </p>
              <p className="text-gold text-2xl font-light tracking-widest">(+84) 945 409 408</p>
            </div>
          </div>
          
          <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <span className="text-[9px] uppercase tracking-[0.4em] text-premium-sand/20">&copy; 2024 Bún Chả Chinh Hương. All rights reserved.</span>
            <div className="flex gap-8 text-[9px] uppercase tracking-[0.4em] text-premium-sand/20">
              <span className="hover:text-gold cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-gold cursor-pointer transition-colors">Terms</span>
            </div>
          </div>
        </div>
      </footer>
      <ToastContainer />
    </div>
  );
}

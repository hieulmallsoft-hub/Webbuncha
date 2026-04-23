import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { loginUser } from "../lib/api.js";
import { setToken } from "../lib/auth.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState(location.state?.message || "");

  useEffect(() => {
    setTimeout(() => {
      document.body.classList.add("loaded");
      document.querySelectorAll('.slide-reveal-x').forEach(el => el.classList.add('is-visible'));
    }, 100);
    return () => document.body.classList.remove("loaded");
  }, []);

  useEffect(() => {
    if (location.state?.message) setStatus(location.state.message);
  }, [location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Đang xác thực nếp nhà...");
    const res = await loginUser(form);
    if (res.status >= 200 && res.status < 300 && res.data?.data?.accessToken) {
      setToken(res.data.data.accessToken);
      setStatus("Cửa lớn đã mở. Đang mời bạn vào...");
      navigate("/account");
      return;
    }
    setStatus(res.data?.message || "Thông tin chưa khớp. Bạn vui lòng kiểm tra lại.");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col lg:flex-row overflow-hidden font-sans text-[#1A1A1A]">
      <style>
        {`
          .slide-reveal-x {
            opacity: 0;
            transform: translateX(var(--slide-dist, -50px));
            transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .is-visible {
            opacity: 1;
            transform: translateX(0);
          }
          .light-glass-bg {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            border: 1px solid #F0EBE1;
          }
          .custom-input-line {
            width: 100%;
            background: transparent;
            border: none;
            border-bottom: 2px solid #F0EBE1;
            padding: 14px 0;
            font-size: 1rem;
            color: #1A1A1A;
            transition: border-color 0.4s ease;
            font-weight: 600;
          }
          .custom-input-line:focus {
            outline: none;
            border-bottom-color: #6A7B53;
          }
          .custom-input-line::placeholder {
            color: rgba(0, 0, 0, 0.2);
            text-transform: uppercase;
            letter-spacing: 0.15em;
            font-size: 0.75rem;
            font-weight: 800;
          }
        `}
      </style>

      {/* Left side: Artistic Presentation */}
      <div className="hidden lg:flex lg:w-1/2 relative slide-reveal-x items-center justify-center p-20" style={{"--slide-dist": "-80px"}}>
         <div className="absolute inset-0 bg-[#FDFBF7] z-0"></div>
         {/* Bamboo aesthetic decorative image card */}
         <div className="relative z-10 w-full max-w-lg">
            <div className="absolute -inset-10 border-2 border-[#6A7B53]/10 translate-x-10 translate-y-10 rounded-[40px] z-0"></div>
            <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="/images/z7699818612760_de23ba5e47606cd08555e46fac0639a7.jpg" 
                  alt="Traditional Style" 
                  className="w-full h-full object-cover filter brightness-[0.9] sepia-[0.1]"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <div className="absolute bottom-12 left-12 right-12">
                    <h2 className="font-display text-5xl text-white mb-4 leading-tight font-bold">Hương Vị <br/> <span className="italic text-[#D4AF37]">Vùng Quê</span></h2>
                    <p className="text-white/80 text-sm tracking-widest uppercase font-bold">Tinh hoa ẩm thực Bỉm Sơn</p>
                 </div>
             </div>
          </div>
       </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 relative slide-reveal-x" style={{"--slide-dist": "80px"}}>
        <div className="w-full max-w-md relative z-10">
           <div className="mb-12 md:mb-16">
             <Link to="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] font-extrabold text-[#6A7B53] mb-8 hover:text-[#1A1A1A] transition-colors">
               ← Quay Lại
             </Link>
            <p className="text-[10px] uppercase tracking-[0.5em] text-[#B8860B] font-extrabold mb-3">Thân chào quý khách</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] font-bold">Đăng nhập</h2>
           </div>
           
           <form className="space-y-10" onSubmit={handleSubmit}>
             <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/40 font-extrabold">Địa chỉ thư điện tử</label>
               <input
                 id="email"
                 type="email"
                 className="custom-input-line"
                placeholder="email@vidu.com"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </div>
             
             <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/40 font-extrabold">Mật mã truy cập</label>
               <input
                 id="password"
                 type="password"
                 className="custom-input-line"
                placeholder="********"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </div>
            
            <div className="flex items-center justify-end -mt-4">
              <Link
                to="/forgot-password"
                className="text-[10px] uppercase tracking-[0.35em] font-extrabold text-[#6A7B53] hover:text-[#1A1A1A] transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

             <div className="pt-4">
                <button 
                 className="w-full py-5 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.4em] font-extrabold hover:bg-[#6A7B53] transition-all duration-500 shadow-xl rounded-xl" 
                 type="submit"
                >
                Vào Nếp Nhà
                </button>
             </div>
           </form>
           
           {status && (
            <div className={`mt-8 p-4 rounded-xl border ${status.toLowerCase().includes("thất bại") || status.toLowerCase().includes("chưa khớp") ? 'bg-red-50 border-red-100 text-red-600' : 'bg-[#6A7B53]/5 border-[#6A7B53]/10 text-[#6A7B53]'} text-xs font-bold uppercase tracking-widest text-center`}>
               {status}
             </div>
           )}
           
           <div className="mt-12 text-center border-t border-[#F0EBE1] pt-10">
             <p className="text-[#1A1A1A]/40 text-[10px] font-bold uppercase tracking-widest">
              Bạn mới ghé quán lần đầu?
               <Link to="/register" className="text-[#6A7B53] font-extrabold border-b border-[#6A7B53]/40 hover:border-[#6A7B53] transition-all ml-3">
                Đăng ký ngay
               </Link>
             </p>
           </div>
         </div>
       </div>
    </div>
  );
}


import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../lib/api.js";
import { setToken } from "../lib/auth.js";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    // Kích hoạt animation khi load trang
    setTimeout(() => {
      document.body.classList.add("loaded");
      document.querySelectorAll('.slide-in-right, .slide-in-left').forEach(el => el.classList.add('is-visible'));
    }, 100);
    return () => {
      document.body.classList.remove("loaded");
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Đang xác thực...");
    const res = await loginUser(form);
    if (res.status >= 200 && res.status < 300 && res.data?.data?.accessToken) {
      setToken(res.data.data.accessToken);
      setStatus("Đăng nhập thành công. Đang chuyển hướng...");
      navigate("/account");
      return;
    }
    setStatus(res.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.");
  };

  return (
    <div className="min-h-screen bg-[#050505] flex overflow-hidden font-sans text-gray-100">
      <style>
        {`
          .slide-in-left {
            opacity: 0;
            transform: translateX(-150px);
            transition: all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          .slide-in-right {
            opacity: 0;
            transform: translateX(150px);
            transition: all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          .is-visible {
            opacity: 1;
            transform: translateX(0);
          }
          .glass-panel {
            background: rgba(15, 15, 15, 0.85);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.05);
          }
          .custom-input {
            width: 100%;
            background: transparent;
            border: none;
            border-bottom: 2px solid rgba(255, 255, 255, 0.2);
            padding: 16px 0;
            font-size: 1.1rem;
            color: #fff;
            transition: border-color 0.4s ease;
          }
          .custom-input:focus {
            outline: none;
            border-bottom: 2px solid #d4af37;
          }
          .custom-input::placeholder {
            color: rgba(255, 255, 255, 0.3);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-size: 0.85rem;
          }
        `}
      </style>

      {/* Left side: Cinematic Image Presentation */}
      <div className="hidden lg:block lg:w-3/5 relative slide-in-left">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#050505] z-10"></div>
        <img 
          src="/images/z7699818612760_de23ba5e47606cd08555e46fac0639a7.jpg" 
          alt="Fine Dining" 
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.6] sepia-[0.2]"
        />
        <div className="absolute top-12 left-12 z-20">
          <Link to="/" className="text-gold uppercase tracking-[0.4em] font-bold text-sm hover:text-white transition-colors">
            ← Quay Lại
          </Link>
        </div>
        <div className="absolute bottom-20 left-20 z-20 max-w-lg">
          <h1 className="font-display text-7xl text-white mb-6 drop-shadow-2xl">Tinh Hoa <br/> <span className="italic text-gold">Hội Tụ</span></h1>
          <p className="text-gray-300 text-lg leading-loose font-medium">Bắt đầu hành trình thưởng thức ẩm thực đỉnh cao bằng việc truy cập tài khoản của bạn.</p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 lg:p-20 relative slide-in-right delay-200">
        <div className="absolute top-12 right-12 lg:hidden">
          <Link to="/" className="text-gold uppercase tracking-[0.4em] font-bold text-xs hover:text-white transition-colors">
            ← Quay Lại
          </Link>
        </div>
        
        <div className="w-full max-w-md glass-panel p-10 lg:p-14 rounded-2xl shadow-2xl relative z-10">
          <div className="mb-14">
            <p className="text-xs uppercase tracking-[0.5em] text-gold font-bold mb-4 block">Chào mừng trở lại</p>
            <h2 className="font-display text-4xl text-white font-semibold">Đăng nhập</h2>
          </div>
          
          <form className="space-y-10" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                id="email"
                type="email"
                className="custom-input"
                placeholder="Nhập địa chỉ Email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </div>
            
            <div className="relative">
              <input
                id="password"
                type="password"
                className="custom-input"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </div>
            
            <button 
              className="w-full py-5 mt-6 bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] text-[#050505] text-sm uppercase tracking-[0.3em] font-extrabold hover:from-white hover:to-white transition-all duration-500 shadow-[0_10px_20px_rgba(212,175,55,0.2)] rounded-sm" 
              type="submit"
            >
              Vào Không Gian
            </button>
          </form>
          
          {status && (
            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className={`text-sm font-medium ${status.includes('thất bại') ? 'text-red-400' : 'text-gold'}`}>{status}</p>
            </div>
          )}
          
          <div className="mt-12 text-center border-t border-white/10 pt-8">
            <p className="text-gray-400 text-sm font-medium">
              Bạn chưa có tài khoản?{" "}
              <Link to="/register" className="text-gold font-bold uppercase tracking-wider hover:text-white transition-colors ml-2">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

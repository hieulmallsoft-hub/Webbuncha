import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../lib/api.js";
import { setProfileName } from "../lib/auth.js";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    address: ""
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    setTimeout(() => {
      document.querySelectorAll('.slide-presentation').forEach(el => el.classList.add('is-visible'));
    }, 100);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Đang xử lý...");
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      age: form.age ? Number(form.age) : null,
      address: form.address || null
    };
    const res = await registerUser(payload);
    if (res.status >= 200 && res.status < 300) {
      setProfileName(form.name);
      setStatus("Đăng ký thành công. Đang chuyển tới đăng nhập...");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    setStatus(res.data?.message || "Đăng ký thất bại. Xin vui lòng thử lại.");
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col lg:flex-row-reverse overflow-x-hidden font-sans text-gray-100">
      <style>
        {`
          .slide-presentation {
            opacity: 0;
            transition: all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          .slide-from-right {
            transform: translateX(150px);
          }
          .slide-from-left {
            transform: translateX(-150px);
          }
          .slide-from-bottom {
            transform: translateY(100px);
          }
          .is-visible.slide-from-right, .is-visible.slide-from-left, .is-visible.slide-from-bottom {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
          .glass-box {
            background: rgba(10, 10, 10, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(212, 175, 55, 0.15);
          }
          .premium-input {
            width: 100%;
            background: transparent;
            border: none;
            border-bottom: 2px solid rgba(255, 255, 255, 0.15);
            padding: 12px 0;
            font-size: 1.1rem;
            color: #fff;
            transition: all 0.4s ease;
          }
          .premium-input:focus {
            outline: none;
            border-bottom: 2px solid #d4af37;
            padding-left: 10px;
          }
          .premium-input::placeholder {
            color: rgba(255, 255, 255, 0.25);
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
        `}
      </style>

      {/* Hero Image Section (Right Side on Desktop) */}
      <div className="w-full lg:w-1/2 h-64 lg:h-screen relative slide-presentation slide-from-right">
        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-transparent via-transparent to-[#050505] z-10"></div>
        <img 
          src="/images/z7699818623770_8a62f4a85b03b59c3ced823381b7ec55.jpg" 
          alt="Registration Culinary Art" 
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] contrast-125"
        />
        <div className="absolute top-10 right-10 z-20 hidden lg:block">
          <Link to="/" className="text-gold uppercase tracking-[0.4em] font-bold text-sm hover:text-white transition-colors">
            X Đóng
          </Link>
        </div>
      </div>

      {/* Form Section (Left Side on Desktop) */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 lg:p-16 relative">
        <div className="w-full max-w-xl glass-box p-10 lg:p-16 rounded-2xl shadow-2xl relative z-20 -mt-20 lg:mt-0 slide-presentation slide-from-bottom">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.6em] text-gold font-bold mb-4 block">Membership</span>
            <h2 className="font-display text-5xl text-white font-semibold mb-4">Gia Nhập</h2>
            <p className="text-gray-400 text-sm leading-relaxed">Đăng ký thành viên để trải nghiệm hệ thống đặt bàn và nhận ưu đãi đặc quyền tối thượng.</p>
          </div>

          <form className="space-y-8 lg:space-y-10" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                id="name"
                className="premium-input"
                placeholder="Họ và tên của bạn"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            
            <div className="relative">
              <input
                id="email"
                type="email"
                className="premium-input"
                placeholder="Địa chỉ Email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </div>
            
            <div className="relative">
              <input
                id="password"
                type="password"
                className="premium-input"
                placeholder="Tạo mật khẩu"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="relative">
                <input
                  id="age"
                  type="number"
                  min="1"
                  max="150"
                  className="premium-input"
                  placeholder="Độ tuổi"
                  value={form.age}
                  onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
                />
              </div>
              <div className="relative">
                <input
                  id="address"
                  className="premium-input"
                  placeholder="Tỉnh/Thành"
                  value={form.address}
                  onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                />
              </div>
            </div>
            
            <button 
              className="w-full py-6 mt-8 bg-transparent border-2 border-gold text-gold text-sm uppercase tracking-[0.4em] font-extrabold hover:bg-gold hover:text-black transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.15)] rounded-sm" 
              type="submit"
            >
              Hoàn Tất Đăng Ký
            </button>
          </form>

          {status && (
            <div className="mt-8 p-5 bg-black/40 border-l-4 border-gold">
              <p className={`text-sm font-semibold ${status.includes('thất bại') ? 'text-red-400' : 'text-gold'}`}>{status}</p>
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm font-medium">
              Bạn đã là Hội viên?{" "}
              <Link to="/login" className="text-white font-bold uppercase tracking-wider hover:text-gold transition-colors ml-2 border-b border-white hover:border-gold pb-1">
                Đăng Nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

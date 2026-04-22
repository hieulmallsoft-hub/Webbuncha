import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../lib/api.js";
import { setProfileName } from "../lib/auth.js";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    age: "",
    address: ""
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    setTimeout(() => {
      document.querySelectorAll('.slide-reveal-up').forEach(el => el.classList.add('is-visible'));
    }, 100);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Đang ghi tên vào sổ...");
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      age: form.age ? Number(form.age) : null,
      address: form.address || null
    };
    const res = await registerUser(payload);
    if (res.status >= 200 && res.status < 300) {
      setProfileName(form.name);
      const message = "Đăng ký thành công. Vui lòng kiểm tra email để xác thực (link xác thực đang được in trong log server).";
      setStatus(message);
      setTimeout(() => navigate("/login", { state: { message } }), 1500);
      return;
    }
    setStatus(res.data?.message || "Đăng ký chưa thành. Mời bạn kiểm tra lại thông tin.");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col lg:flex-row-reverse overflow-hidden font-sans text-[#1A1A1A]">
      <style>
        {`
          .slide-reveal-up {
            opacity: 0;
            transform: translateY(40px);
            transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .is-visible {
            opacity: 1;
            transform: translateY(0);
          }
          .custom-input-box {
            width: 100%;
            background: #FFFFFF;
            border: 1px solid #F0EBE1;
            border-radius: 12px;
            padding: 14px 20px;
            font-size: 1rem;
            color: #1A1A1A;
            transition: all 0.3s ease;
            font-weight: 600;
          }
          .custom-input-box:focus {
            outline: none;
            border-color: #6A7B53;
            box-shadow: 0 0 0 4px rgba(106, 123, 83, 0.1);
          }
          .custom-input-box::placeholder {
            color: rgba(0, 0, 0, 0.2);
            font-size: 0.8rem;
            font-weight: 700;
          }
        `}
      </style>

      {/* Hero Content Section */}
      <div className="w-full lg:w-1/2 h-64 lg:h-screen relative slide-reveal-up overflow-hidden lg:p-12">
        <div className="absolute inset-0 bg-[#FDFBF7] z-0"></div>
        <div className="relative h-full w-full rounded-[40px] overflow-hidden shadow-2xl border-4 border-white lg:border-8">
            <img 
              src="/images/z7699818623770_8a62f4a85b03b59c3ced823381b7ec55.jpg" 
              className="w-full h-full object-cover filter brightness-[0.9] sepia-[0.15]" 
              alt="Traditional Heritage" 
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/60 to-transparent"></div>
            <div className="absolute bottom-10 left-10 right-10 z-20">
               <h2 className="font-display text-4xl md:text-6xl text-white mb-4 font-bold drop-shadow-lg">Gia Nhập <br/> <span className="italic text-[#D4AF37]">Hội Viên</span></h2>
               <p className="text-white/80 text-[10px] md:text-sm tracking-[0.4em] uppercase font-bold">Nhận ưu đãi trọn vị quê nhà</p>
            </div>
            <div className="absolute top-10 right-10 z-30 hidden lg:block">
               <Link to="/" className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-bold hover:bg-white/20 transition-all border border-white/20">
                  ✕
               </Link>
            </div>
        </div>
      </div>

      {/* Register Form Section */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 md:p-12 lg:p-24 relative slide-reveal-up" style={{transitionDelay: '200ms'}}>
        <div className="w-full max-w-lg z-20">
          <div className="mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] font-extrabold text-[#6A7B53] mb-10 lg:hidden">
               ← Quay Lại
            </Link>
            <span className="text-[10px] uppercase tracking-[0.6em] text-[#B8860B] font-extrabold mb-4 block">Membership Registration</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] font-bold mb-6">Đăng ký</h2>
            <p className="text-[#1A1A1A]/50 text-xs md:text-sm leading-relaxed font-bold uppercase tracking-wider">Mở tài khoản để đặt món nhanh chóng và tích lũy điểm thưởng từ Chinh Hương.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-1 gap-6">
               <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/40 font-extrabold ml-1">Tên gọi thân mật</label>
                  <input
                    id="name"
                    className="custom-input-box"
                    placeholder="Nguyễn Văn An"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    required
                  />
               </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/40 font-extrabold ml-1">Số điện thoại</label>
              <input
                id="phone"
                inputMode="tel"
                className="custom-input-box"
                placeholder="+84901234567"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/40 font-extrabold ml-1">Thư điện tử (Email)</label>
              <input
                id="email"
                type="email"
                className="custom-input-box"
                placeholder="an.nguyen@vidu.com"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/40 font-extrabold ml-1">Mật mã truy cập</label>
              <input
                id="password"
                type="password"
                className="custom-input-box"
                placeholder="Tối thiểu 6 ký tự"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/40 font-extrabold ml-1">Độ tuổi</label>
                <input
                  id="age"
                  type="number"
                  min="1"
                  className="custom-input-box"
                  placeholder="Ví dụ: 25"
                  value={form.age}
                  onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/40 font-extrabold ml-1">Địa chỉ (Tỉnh/Thành)</label>
                <input
                  id="address"
                  className="custom-input-box"
                  placeholder="Thanh Hóa"
                  value={form.address}
                  onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                />
              </div>
            </div>
            
            <div className="pt-6">
               <button 
                className="w-full py-5 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.4em] font-extrabold hover:bg-[#6A7B53] transition-all duration-500 shadow-xl rounded-xl" 
                type="submit"
               >
                Đăng Ký Hội Viên
               </button>
            </div>
          </form>

          {status && (
            <div className={`mt-8 p-4 rounded-xl border ${status.includes('thất bại') || status.includes('chưa thành') ? 'bg-red-50 border-red-100 text-red-600' : 'bg-[#6A7B53]/5 border-[#6A7B53]/10 text-[#6A7B53]'} text-[10px] font-bold uppercase tracking-widest text-center`}>
              {status}
            </div>
          )}

          <div className="mt-12 text-center border-t border-[#F0EBE1] pt-10">
            <p className="text-[#1A1A1A]/40 text-[10px] font-bold uppercase tracking-widest">
              Bạn đã có tài khoản rồi?
              <Link to="/login" className="text-[#6A7B53] font-extrabold border-b border-[#6A7B53]/40 hover:border-[#6A7B53] transition-all ml-3">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

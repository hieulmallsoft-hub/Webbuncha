import { getProfileFromToken, getProfileName, clearToken } from "../lib/auth.js";
import { Link, useNavigate } from "react-router-dom";

export default function Account() {
  const profile = getProfileFromToken();
  const name = getProfileName() || "Guest";
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate('/login');
    // Force a reload or update state if necessary, but navigate is usually fine
    window.location.reload();
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen text-[#1A1A1A] font-sans overflow-x-hidden pb-12 md:pb-20">
      <style>
        {`
          .slide-in-bottom {
            animation: slideUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            opacity: 0;
            transform: translateY(40px);
          }
          .delay-200 { animation-delay: 200ms; }
          .delay-400 { animation-delay: 400ms; }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .light-glass-panel {
            background: #FFFFFF;
            border: 1px solid rgba(0,0,0,0.03);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.04);
            transition: all 0.4s ease;
          }
          .light-glass-panel:hover {
            box-shadow: 0 20px 40px rgba(184, 134, 11, 0.08);
            border-color: rgba(184, 134, 11, 0.2);
          }
        `}
      </style>

      {/* Hero Section */}
      <section className="relative h-[35vh] md:h-[45vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105 filter brightness-[0.7] sepia-[0.1]"
          style={{ backgroundImage: "url(/images/z7699819298138_5ea6bacf9d760fe5a02bd43fc7c1569b.jpg)" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-[#FDFBF7]"></div>
        <div className="relative z-10 text-center px-4 mt-8 md:mt-16 slide-in-bottom">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[#D4AF37] font-bold mb-3 md:mb-4 drop-shadow-md">
            Trang chủ / Tài khoản
          </p>
          <h2 className="font-display text-4xl md:text-6xl text-[#1A1A1A] mb-4 md:mb-6 tracking-wide [text-shadow:0_2px_15px_rgba(255,255,255,0.7)]">
            Đặc Quyền Thành Viên
          </h2>
          <div className="mt-4 md:mt-8 w-12 md:w-16 h-[2px] bg-[#B8860B] mx-auto opacity-70"></div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-6 md:mt-12 slide-in-bottom delay-200 relative z-10 md:-mt-10">
        
        <div className="text-center mb-10 md:mb-16">
          <h3 className="font-display text-2xl md:text-3xl text-[#1A1A1A] mb-2">Hồ sơ cá nhân</h3>
          <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#8B7355] flex items-center justify-center gap-2 font-semibold">
            <span className={`w-2 h-2 rounded-full ${profile ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`}></span>
            {profile ? "Đang hoạt động" : "Chưa đăng nhập"}
          </p>
        </div>

        {profile ? (
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            <div className="light-glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-[#D4AF37]/10 transition-colors"></div>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 md:mb-8 border-b border-[#F0EBE1] pb-6 text-center sm:text-left">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#333333] flex items-center justify-center text-white font-display text-3xl md:text-4xl shadow-lg shrink-0">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="mt-2 sm:mt-0">
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-[#8B7355] font-semibold mb-1">Định danh</p>
                  <h4 className="font-display text-2xl md:text-3xl text-[#1A1A1A]">{name}</h4>
                </div>
              </div>

              <div className="space-y-5 md:space-y-6">
                <div>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-[#8B7355] font-semibold mb-2">Thư điện tử</p>
                  <p className="text-[#1A1A1A] bg-[#FAFAFA] border border-[#F0EBE1] p-3 md:p-4 rounded-xl text-sm md:text-base font-medium">{profile.email || "Chưa cập nhật"}</p>
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-[#8B7355] font-semibold mb-2">Vai trò hệ thống</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {profile.roles?.length ? profile.roles.map(r => (
                      <span key={r} className="px-4 py-1.5 bg-[#1A1A1A]/5 text-[#B8860B] border border-[#B8860B]/30 rounded-md text-[10px] uppercase tracking-widest font-bold shadow-sm">{r}</span>
                    )) : (
                      <span className="text-[#1A1A1A]/50 text-sm italic">Khách</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-[#8B7355] font-semibold mb-2">Hiệu lực phiên đăng nhập</p>
                  <p className="text-[#1A1A1A]/80 text-xs md:text-sm font-mono bg-[#FAFAFA] border border-[#F0EBE1] p-3 md:p-4 rounded-xl">
                    {profile.expiresAt ? profile.expiresAt.toLocaleString() : "Không giới hạn"}
                  </p>
                </div>
              </div>

              <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-[#F0EBE1]">
                <button 
                  onClick={handleLogout}
                  className="w-full py-3 md:py-4 bg-transparent border border-[#1A1A1A]/20 text-[#1A1A1A] text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-all duration-300 rounded-lg shadow-sm"
                >
                  Đăng xuất tài khoản
                </button>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8 slide-in-bottom delay-400">
              <div className="light-glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none"></div>
                <h4 className="font-display text-xl md:text-2xl text-[#1A1A1A] mb-2 md:mb-3">Ưu đãi độc quyền</h4>
                <div className="w-12 h-[2px] bg-[#B8860B] mb-5 md:mb-6"></div>
                <p className="text-sm text-[#1A1A1A]/70 leading-relaxed md:leading-loose">
                  Thiết kế để mang đến trải nghiệm 5 sao. Hệ thống điểm thưởng và các hạng thẻ thành viên đang được xây dựng và sẽ sớm ra mắt.
                </p>
              </div>

              <div className="light-glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden">
                <h4 className="font-display text-xl md:text-2xl text-[#1A1A1A] mb-2 md:mb-3">Lịch sử giao dịch</h4>
                <div className="w-12 h-[2px] bg-[#B8860B] mb-5 md:mb-6"></div>
                
                <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center border border-[#F0EBE1] rounded-xl bg-[#FAFAFA]">
                  <p className="text-[#1A1A1A]/40 uppercase tracking-widest text-[9px] md:text-[10px] font-semibold mb-4 md:mb-5">Chưa có giao dịch gần đây</p>
                  <Link 
                    to="/menu" 
                    className="px-6 md:px-8 py-3 bg-[#1A1A1A] text-white border border-transparent hover:bg-[#D4AF37] hover:text-[#1A1A1A] transition-all duration-300 rounded-md text-[10px] uppercase tracking-widest font-bold shadow-md"
                  >
                    Bắt đầu đặt món
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 md:py-20 light-glass-panel rounded-2xl mx-auto max-w-lg">
            <h4 className="font-display text-2xl text-[#1A1A1A] mb-3 md:mb-4">Vui lòng xác thực</h4>
            <div className="w-12 h-[2px] bg-[#B8860B] mb-5 md:mb-6"></div>
            <p className="text-[#1A1A1A]/60 text-sm md:text-base mb-8 md:mb-10 text-center max-w-xs leading-relaxed px-4">Truy cập để quản lý thông tin thành viên và tận hưởng các đặc quyền từ hệ thống nhà hàng của chúng tôi.</p>
            <Link 
              to="/login"
              className="px-8 md:px-12 py-3 md:py-4 bg-[#1A1A1A] text-white text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#D4AF37] hover:text-[#1A1A1A] transition-all duration-300 rounded-lg shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_25px_rgba(212,175,55,0.2)]"
            >
              Đăng nhập hệ thống
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

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
    <div className="bg-[#050505] min-h-screen text-gray-100 font-sans overflow-x-hidden pb-20">
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
          .glass-card {
            background: linear-gradient(145deg, rgba(20,20,20,0.95), rgba(10,10,10,0.98));
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
            transition: all 0.4s ease;
          }
          .glass-card:hover {
            border-color: rgba(212, 175, 55, 0.3);
            box-shadow: 0 30px 60px rgba(212, 175, 55, 0.05);
          }
        `}
      </style>

      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105 filter brightness-50 sepia-[0.3]"
          style={{ backgroundImage: "url(/images/z7699819298138_5ea6bacf9d760fe5a02bd43fc7c1569b.jpg)" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#050505]"></div>
        <div className="relative z-10 text-center px-4 mt-16 slide-in-bottom">
          <p className="text-[10px] uppercase tracking-[0.5em] text-gold/80 font-bold mb-4 drop-shadow-md">
            Trang chủ / Tài khoản
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-white mb-6 tracking-wide drop-shadow-2xl">
            Đặc Quyền Thành Viên
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-gold/20 via-gold to-gold/20 mx-auto"></div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-12 slide-in-bottom delay-200 relative z-10">
        
        <div className="text-center mb-16">
          <h3 className="font-display text-3xl text-white mb-2">Hồ sơ cá nhân</h3>
          <p className="text-sm uppercase tracking-widest text-gold/80 flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full ${profile ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></span>
            {profile ? "Đang hoạt động" : "Chưa đăng nhập"}
          </p>
        </div>

        {profile ? (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-gold/10 transition-colors"></div>
              
              <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4af37] to-[#aa8c2c] flex items-center justify-center text-black font-display text-3xl font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Định danh</p>
                  <h4 className="font-display text-2xl text-white">{name}</h4>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gold/70 mb-2">Thư điện tử</p>
                  <p className="text-white bg-white/[0.02] border border-white/5 p-3 rounded-lg text-sm">{profile.email || "Chưa cập nhật"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gold/70 mb-2">Vai trò hệ thống</p>
                  <div className="flex gap-2">
                    {profile.roles?.length ? profile.roles.map(r => (
                      <span key={r} className="px-3 py-1 bg-gold/10 text-gold border border-gold/20 rounded text-[10px] uppercase tracking-widest">{r}</span>
                    )) : (
                      <span className="text-white/50 text-sm italic">Khách</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gold/70 mb-2">Hiệu lực phiên đăng nhập</p>
                  <p className="text-white/70 text-sm font-mono bg-[#0c0c0c] border border-white/5 p-3 rounded-lg">
                    {profile.expiresAt ? profile.expiresAt.toLocaleString() : "Không giới hạn"}
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-white/5">
                <button 
                  onClick={handleLogout}
                  className="w-full py-4 bg-transparent border border-white/10 text-white/60 text-xs uppercase tracking-[0.2em] hover:bg-white/5 hover:text-white hover:border-white/30 transition-all duration-300 rounded-sm"
                >
                  Đăng xuất tài khoản
                </button>
              </div>
            </div>

            <div className="space-y-8 slide-in-bottom delay-400">
              <div className="glass-card rounded-2xl p-8 relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none"></div>
                <h4 className="font-display text-2xl text-white mb-2">Ưu đãi độc quyền</h4>
                <div className="w-10 h-1 bg-gradient-to-r from-gold to-transparent mb-6"></div>
                <p className="text-sm text-white/60 leading-relaxed">
                  Thiết kế để mang đến trải nghiệm 5 sao. Hệ thống điểm thưởng và các hạng thẻ thành viên đang được xây dựng và sẽ sớm ra mắt.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-8 relative overflow-hidden border border-white/5">
                <h4 className="font-display text-2xl text-white mb-2">Lịch sử giao dịch</h4>
                <div className="w-10 h-1 bg-gradient-to-r from-gold to-transparent mb-6"></div>
                
                <div className="flex flex-col items-center justify-center py-10 text-center border border-white/5 rounded-xl bg-[#0c0c0c]">
                  <p className="text-white/40 uppercase tracking-widest text-[10px] mb-5">Chưa có giao dịch gần đây</p>
                  <Link 
                    to="/menu" 
                    className="px-6 py-3 bg-gradient-to-r from-gold/10 to-transparent text-gold border border-gold/30 hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 rounded-sm text-[10px] uppercase tracking-wider font-semibold"
                  >
                    Bắt đầu đặt món
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 glass-card rounded-2xl mx-auto max-w-lg border border-white/5">
            <h4 className="font-display text-2xl text-white mb-4">Vui lòng xác thực</h4>
            <div className="w-12 h-1 bg-gold/50 mb-6"></div>
            <p className="text-white/50 text-sm mb-10 text-center max-w-xs leading-relaxed">Truy cập để quản lý thông tin thành viên và tận hưởng các đặc quyền từ hệ thống nhà hàng của chúng tôi.</p>
            <Link 
              to="/login"
              className="px-10 py-4 bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] text-black text-[10px] uppercase tracking-[0.2em] font-extrabold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 rounded-sm"
            >
              Đăng nhập hệ thống
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="bg-[#FDFBF7] min-h-screen flex items-center justify-center p-6 text-center">
      <div className="max-w-md animate-fade-up">
        <span className="text-[12rem] font-display font-bold leading-none text-[#6A7B53]/10 block select-none">404</span>
        <div className="-mt-16 relative z-10">
           <span className="text-4xl mb-4 block">🎋</span>
           <h3 className="font-display text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">Lạc bước giữa đồng quê</h3>
           <p className="text-[#1A1A1A]/60 text-sm md:text-base mb-10 leading-relaxed font-medium">Trang quý khách tìm kiếm có vẻ đã "đi vắng" hoặc chưa từng tồn tại trong mẹt thực đơn của chúng tôi.</p>
           <Link className="inline-block px-10 py-4 bg-[#6A7B53] text-white text-[10px] uppercase tracking-[0.4em] font-extrabold hover:bg-[#1C2B1C] transition-all shadow-xl rounded-xl" to="/">
             Quay Về Trang Chủ
           </Link>
        </div>
      </div>
    </div>
  );
}

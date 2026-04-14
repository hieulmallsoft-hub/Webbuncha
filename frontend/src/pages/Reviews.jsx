import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../lib/api.js";
import { getProfileFromToken, getProfileName } from "../lib/auth.js";
import { useToast } from "../context/ToastContext.jsx";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

const STORAGE_KEY = "customer_reviews";

const loadReviews = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
};

const saveReviews = (reviews) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
};

const stars = [1, 2, 3, 4, 5];

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
};

export default function Reviews() {
  const profile = useMemo(() => getProfileFromToken(), []);
  const profileName = getProfileName();
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [canComment, setCanComment] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setReviews(loadReviews());
    const timer = setTimeout(() => {
      document.querySelectorAll('.slide-presentation').forEach(el => el.classList.add('is-visible'));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      setError("Vui lòng đăng nhập để lưu bút cảm nhận.");
      setCanComment(false);
      return;
    }
    let active = true;
    const loadOrders = async () => {
      setLoading(true);
      const res = await getOrders();
      if (!active) return;
      if (res.status >= 200 && res.status < 300) {
        const payload = res.data?.data;
        const data = Array.isArray(payload) ? payload : payload?.content || [];
        setCanComment(data.length > 0);
        setError(data.length > 0 ? "" : "Chỉ thực khách đã trải nghiệm mới được viết lưu bút.");
      } else {
        setCanComment(false);
        setError(res.data?.message || "Không thể kiểm tra đơn hàng.");
      }
      setLoading(false);
    };
    loadOrders();
    return () => { active = false; };
  }, [profile]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = content.trim();
    if (!text) {
      addToast({ type: "warning", title: "Nội dung còn trống", message: "Hãy chia sẻ cảm nhận của bạn." });
      return;
    }
    const review = {
      id: Date.now(),
      customer: profileName || profile?.email || "Thực khách",
      rating,
      content: text,
      createdAt: new Date().toISOString()
    };
    const next = [review, ...reviews];
    setReviews(next);
    saveReviews(next);
    setContent("");
    setRating(5);
    addToast({ type: "success", title: "Đã gửi", message: "Cảm ơn bạn đã đóng góp tinh hoa cho quán!" });
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen text-[#1A1A1A] font-sans selection:bg-[#6A7B53] selection:text-white pb-24 md:pb-32 overflow-hidden">
      <style>
        {`
          .slide-presentation {
            opacity: 0;
            transform: translateY(30px);
            transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .slide-presentation.is-visible {
            opacity: 1;
            transform: translateY(0);
          }
           .light-glass-bg {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            border: 1px solid #F0EBE1;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.02);
          }
          .custom-textarea {
            width: 100%;
            background: #FAFAFA;
            border: 1px solid #F0EBE1;
            padding: 20px;
            font-size: 1rem;
            color: #1A1A1A;
            transition: all 0.4s ease;
            font-weight: 500;
          }
          .custom-textarea:focus {
            outline: none;
            border-color: #6A7B53;
            background: #FFF;
          }
        `}
      </style>

      {/* Hero Banner Section */}
      <section className="relative h-[45vh] md:h-[55vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/z7699818644305_2d4593c168855b379e693ea8a463137d.jpg')] bg-cover bg-center filter brightness-[0.7] sepia-[0.1]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#FDFBF7]"></div>
        
        <div className="relative z-10 text-center px-4 mt-12 max-w-4xl mx-auto slide-presentation">
          <span className="inline-block px-6 py-2 border border-white/40 text-[10px] uppercase tracking-[0.5em] text-white/90 font-bold mb-6 bg-black/20 backdrop-blur-sm rounded-full">
            Guest Review Book
          </span>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-6 uppercase tracking-[0.2em] font-bold drop-shadow-2xl">
            Lưu Bút
          </h2>
          <div className="w-16 h-1 bg-[#6A7B53] mx-auto rounded-full"></div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4 md:mt-12 relative z-20 md:-mt-16">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left: Input Review Form */}
          <section className="lg:col-span-5 slide-presentation" style={{ transitionDelay: '100ms' }}>
            <div className="light-glass-bg p-8 md:p-12 rounded-[2rem] border-t-4 border-t-[#B8860B]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8860B] font-extrabold mb-4">Mời quý khách đề bút</p>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-8 pb-6 border-b border-[#F0EBE1]">Cảm Nhận</h3>
              
              {loading && (
                <div className="flex items-center gap-3 text-[#6A7B53] text-[10px] uppercase tracking-widest font-extrabold py-6">
                   <div className="w-4 h-4 border-2 border-[#6A7B53] border-t-transparent rounded-full animate-spin"></div>
                   Đang chuẩn bị trang giấy...
                </div>
              )}
              
              {!loading && error && (
                <div className="py-8 px-6 bg-[#FAFAFA] rounded-2xl border border-[#F0EBE1] text-center">
                  <p className="text-xs md:text-sm text-[#1A1A1A]/60 font-bold uppercase tracking-wider leading-loose">
                    {error} <br/>
                    {!profile && (
                      <Link to="/login" className="mt-6 inline-block bg-[#6A7B53] px-10 py-3 text-white rounded-lg hover:bg-[#1C2B1C] transition-all no-underline shadow-lg">
                        Đăng Nhập Ngay
                      </Link>
                    )}
                  </p>
                </div>
              )}

              {!loading && canComment && (
                <form className="mt-8 space-y-10" onSubmit={handleSubmit}>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.3em] text-[#1A1A1A]/40 font-extrabold block mb-6 px-1">Mức độ hài lòng của quý khách</label>
                    <div className="flex flex-wrap gap-4">
                      {stars.map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all duration-500 font-display text-xl ${
                            rating === value 
                              ? "border-[#6A7B53] bg-[#6A7B53] text-white font-bold shadow-lg shadow-[#6A7B53]/20" 
                              : "border-[#F0EBE1] text-[#1A1A1A]/30 hover:border-[#6A7B53]/40 hover:text-[#6A7B53]"
                          }`}
                          onClick={() => setRating(value)}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.3em] text-[#1A1A1A]/40 font-extrabold block mb-3 px-1" htmlFor="review-content">
                      Những lời nhắn gửi
                    </label>
                    <textarea
                      id="review-content"
                      className="custom-textarea rounded-2xl"
                      rows="6"
                      placeholder="Chia sẻ niềm vui hoặc góp ý cho chúng tôi..."
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      required
                    />
                  </div>
                  
                  <button 
                    className="w-full py-5 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.4em] font-extrabold hover:bg-[#6A7B53] transition-all duration-500 shadow-xl rounded-2xl" 
                    type="submit"
                  >
                    Lưu Bút Ngay
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Right: Guest List Reviews */}
          <section className="lg:col-span-7 slide-presentation" style={{ transitionDelay: '300ms' }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-[#F0EBE1] pb-8">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-0.5 bg-[#6A7B53]"></div>
                 <h3 className="font-display text-3xl md:text-4xl font-bold">Người Bạn Chinh Hương</h3>
               </div>
               <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#1A1A1A]/40">{reviews.length} cảm hứng được lưu lại</p>
            </div>
            
            {reviews.length === 0 ? (
              <div className="bg-white p-20 text-center rounded-[2rem] border border-[#F0EBE1] shadow-sm italic">
                <p className="text-[#1A1A1A]/40 font-bold uppercase tracking-widest text-xs">Cuốn sổ lưu bút vẫn đang chờ những nét chữ đầu tiên...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white p-6 md:p-10 rounded-[2rem] border border-[#F0EBE1] shadow-sm hover:shadow-xl transition-all duration-500 hover:border-[#6A7B53]/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                       <span className="text-6xl font-display">"</span>
                    </div>
                    <div className="flex justify-between items-start mb-6 border-b border-[#FDFBF7] pb-6 relative z-10">
                      <div>
                        <p className="text-xl md:text-2xl font-display font-bold text-[#1A1A1A] mb-1">{review.customer}</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#6A7B53]/60">{formatDate(review.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-[#6A7B53]/5 border border-[#6A7B53]/10 px-4 py-2 rounded-xl">
                        <span className="text-[#6A7B53] font-display text-2xl font-bold leading-none">{review.rating}</span>
                        <span className="text-[9px] uppercase tracking-widest text-[#6A7B53] font-extrabold block mt-0.5">Stars</span>
                      </div>
                    </div>
                    <p className="text-[#1A1A1A]/70 text-base md:text-lg leading-loose italic font-medium relative z-10">"{review.content}"</p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-20 text-center opacity-40 italic">
               <p className="font-display text-xl md:text-2xl">"Tri âm tri kỷ, hội tụ quanh bếp than hoa."</p>
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}

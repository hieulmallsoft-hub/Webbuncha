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
    setTimeout(() => {
      document.querySelectorAll('.slide-presentation').forEach(el => el.classList.add('is-visible'));
    }, 100);
  }, []);

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      setError("Vui lòng đăng nhập để bình luận.");
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
        setError(data.length > 0 ? "" : "Chỉ khách hàng đã trải nghiệm mới được bình luận.");
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
      addToast({ type: "warning", title: "Thiếu nội dung", message: "Nhập nội dung bình luận." });
      return;
    }
    const review = {
      id: Date.now(),
      customer: profileName || profile?.email || "Khách hàng",
      rating,
      content: text,
      createdAt: new Date().toISOString()
    };
    const next = [review, ...reviews];
    setReviews(next);
    saveReviews(next);
    setContent("");
    setRating(5);
    addToast({ type: "success", title: "Đã gửi", message: "Cảm ơn bạn đã bình luận!" });
  };

  return (
    <div className="bg-[#1c1917] min-h-screen text-gray-100 font-sans selection:bg-gold selection:text-black pb-32">
      <style>
        {`
          .slide-presentation {
            opacity: 0;
            transform: translateY(30px);
            transition: all 1s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          .slide-presentation.is-visible {
            opacity: 1;
            transform: translateY(0);
          }
          .glass-panel {
            background: rgba(20, 20, 20, 0.6);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          }
          .custom-textarea {
            width: 100%;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px;
            font-size: 1rem;
            color: #fff;
            transition: border-color 0.4s ease;
            margin-top: 10px;
          }
          .custom-textarea:focus {
            outline: none;
            border-color: #d4af37;
          }
        `}
      </style>

      {/* Cinematic Hero */}
      <section className="relative h-[55vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/z7699818644305_2d4593c168855b379e693ea8a463137d.jpg')] bg-cover bg-center bg-fixed filter brightness-50"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1c1917]/50 to-[#1c1917]"></div>
        
        <div className="relative z-10 text-center px-6 mt-16 max-w-4xl mx-auto slide-presentation">
          <span className="inline-block px-6 py-2 border border-gold/30 text-[10px] uppercase tracking-[0.5em] text-gold mb-6 bg-black/30 backdrop-blur-md">
            Guest Book
          </span>
          <h2 className="font-display text-5xl md:text-7xl text-white mb-6 uppercase tracking-widest drop-shadow-2xl">
            Lưu Bút
          </h2>
          <p className="text-gray-300 uppercase tracking-widest text-xs">Phản hồi của quý khách là tinh hoa của chúng tôi.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12">
          
          {/* Left: Review Form */}
          <section className="slide-presentation" style={{ transitionDelay: '100ms' }}>
            <div className="glass-panel p-10 rounded-2xl sticky top-32">
              <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold mb-4">Gửi Cảm Nhận</p>
              <h3 className="font-display text-4xl text-white mb-8 border-b border-white/10 pb-6">Đánh Giá</h3>
              
              {loading && (
                <div className="text-gold text-sm tracking-widest uppercase py-4">Đang kiểm tra hồ sơ...</div>
              )}
              
              {!loading && error && (
                <div className="py-6 px-4 bg-white/5 rounded border-l-2 border-red-500">
                  <p className="text-sm text-gray-300 leading-loose">
                    {error} <br/>
                    {!profile && (
                      <Link to="/login" className="mt-2 inline-block text-gold underline hover:text-white transition-colors">
                        Tiến hành Đăng Nhập
                      </Link>
                    )}
                  </p>
                </div>
              )}

              {!loading && canComment && (
                <form className="mt-6 space-y-8" onSubmit={handleSubmit}>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-gray-400 block mb-4">Mức độ hài lòng</label>
                    <div className="flex flex-wrap gap-3">
                      {stars.map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`w-10 h-10 flex items-center justify-center border transition-all duration-300 ${
                            rating === value 
                              ? "border-gold bg-gold text-[#050505] font-bold" 
                              : "border-white/20 text-gray-400 hover:border-gold hover:text-gold"
                          }`}
                          onClick={() => setRating(value)}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-gray-400 block" htmlFor="review-content">
                      Nội dung
                    </label>
                    <textarea
                      id="review-content"
                      className="custom-textarea rounded-lg"
                      rows="5"
                      placeholder="Chia sẻ trải nghiệm..."
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      required
                    />
                  </div>
                  
                  <button 
                    className="w-full py-5 bg-gold text-[#0a0a0a] text-xs uppercase tracking-[0.3em] font-extrabold hover:bg-white transition-all shadow-[0_10px_30px_rgba(212,175,55,0.15)]" 
                    type="submit"
                  >
                    Gửi Cảm Nhận
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Right: Review List */}
          <section className="slide-presentation" style={{ transitionDelay: '300ms' }}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-px bg-gold"></div>
              <h3 className="font-display text-4xl text-white">Sổ Lưu Bút</h3>
            </div>
            
            {reviews.length === 0 ? (
              <div className="glass-panel p-16 text-center rounded-2xl">
                <p className="text-gray-400 uppercase tracking-widest text-sm">Chưa có bình luận nào.</p>
              </div>
            ) : (
              <div className="gap-6 columns-1 block">
                {reviews.map((review, idx) => (
                  <div key={review.id} className="glass-panel p-8 rounded-2xl mb-6 break-inside-avoid">
                    <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                      <div>
                        <p className="text-lg font-bold text-white mb-1">{review.customer}</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gold/70">{formatDate(review.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-gold/10 px-3 py-1 rounded">
                        <span className="text-gold font-bold text-sm">{review.rating}</span>
                        <span className="text-[10px] uppercase tracking-widest text-gold/80 block mt-0.5">Sao</span>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-loose italic">"{review.content}"</p>
                  </div>
                ))}
              </div>
            )}
          </section>
          
        </div>
      </div>
    </div>
  );
}

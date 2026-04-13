import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getCategories, getProducts } from "../lib/api.js";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

const normalizePrice = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }
  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
};

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activeFlag = true;
    const load = async () => {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([getCategories(), getProducts()]);
      if (!activeFlag) return;
      
      if (catRes.status >= 200 && catRes.status < 300) {
        setCategories(catRes.data?.data || []);
      }
      if (prodRes.status >= 200 && prodRes.status < 300) {
        setItems(prodRes.data?.data || []);
      }
      if (catRes.status >= 200 && catRes.status < 300 && prodRes.status >= 200 && prodRes.status < 300) {
        setError("");
      } else {
        setError("Không thể tải thực đơn.");
      }
      setLoading(false);
    };
    load();
    return () => { activeFlag = false; };
  }, []);

  const normalizedItems = useMemo(() => items.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || "Hương vị truyền thống, đánh thức mọi giác quan.",
    price: normalizePrice(item.price),
    category: item.categoryName || "Khác",
    imageUrl: item.imageUrl || "/images/z7699818644305_2d4593c168855b379e693ea8a463137d.jpg",
    tag: item.categoryName || "Đặc sắc"
  })), [items]);

  const categoryList = useMemo(() => {
    if (categories.length) return categories.map(c => c.name);
    return Array.from(new Set(normalizedItems.map(i => i.category).filter(Boolean)));
  }, [categories, normalizedItems]);

  const filteredItems = useMemo(() => {
    return activeCategory === "All" 
      ? normalizedItems 
      : normalizedItems.filter(item => item.category === activeCategory);
  }, [activeCategory, normalizedItems]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(".reveal-up");
      elements.forEach(el => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [loading, activeCategory, filteredItems]);

  const handleAddToCart = (item, e) => {
    e.preventDefault();
    addItem(item);
    addToast({
      type: "success",
      title: "Đã thêm vào giỏ",
      message: `${item.name} được chọn.`
    });
  };

  return (
    <div className="bg-[#1c1917] min-h-screen text-white font-sans w-full">
      <style>
        {`
          .glass-nav {
            background: rgba(10, 10, 10, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(212, 175, 55, 0.15);
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .reveal-up {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .reveal-up.is-visible {
            opacity: 1;
            transform: translateY(0);
          }
          .menu-card {
            background: linear-gradient(160deg, #161616 0%, #080808 100%);
            border: 1px solid rgba(255, 255, 255, 0.03);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          }
          .text-gold-gradient {
            background: linear-gradient(to right, #f5e6ad, #d4af37, #aa8c2c);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .hero-parallax {
            background-image: url('/images/z7699820424452_f8d7ab08e70eeb92e0f51c7d1a7c1b76.jpg');
            background-attachment: fixed;
            background-position: center;
            background-size: cover;
          }
        `}
      </style>

      {/* Cinematic Hero */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 hero-parallax transform scale-105 filter brightness-75"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]"></div>
        
        <div className="relative z-10 text-center px-4 mt-20 reveal-up">
          <span className="text-[10px] uppercase tracking-[0.5em] text-gold/80 font-bold mb-6 block drop-shadow-lg">
            Restaurant & Fine Dining
          </span>
          <h2 className="font-display text-6xl md:text-8xl text-white mb-6 uppercase tracking-widest drop-shadow-2xl">
            Thực Đơn
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto tracking-widest uppercase text-xs md:text-sm leading-relaxed">
            Nơi hương vị gia truyền hòa quyện cùng nghệ thuật ẩm thực đương đại, mang đến trải nghiệm đánh thức mọi giác quan.
          </p>
          <div className="mt-12 w-1px h-24 bg-gradient-to-b from-gold to-transparent mx-auto opacity-60"></div>
        </div>
      </section>

      {/* Sticky Categories Navigation */}
      <div className="sticky top-0 z-40 glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex gap-8 overflow-x-auto hide-scrollbar snap-x py-6">
            <button
              onClick={() => setActiveCategory("All")}
              className={`snap-start whitespace-nowrap text-xs uppercase tracking-[0.3em] font-medium transition-all duration-500 pb-2 border-b-2 ${
                activeCategory === "All" ? "text-gold border-gold" : "text-white/50 border-transparent hover:text-white"
              }`}
            >
              Phục vụ chính
            </button>
            {categoryList.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`snap-start whitespace-nowrap text-xs uppercase tracking-[0.3em] font-medium transition-all duration-500 pb-2 border-b-2 ${
                  activeCategory === category ? "text-gold border-gold" : "text-white/50 border-transparent hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Menu Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 min-h-[50vh]">
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 reveal-up">
            <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-gold tracking-[0.3em] uppercase text-xs">Đang chuẩn bị mỹ vị...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20 text-red-400 reveal-up">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="text-center py-32 reveal-up">
            <p className="text-white/40 uppercase tracking-[0.2em] text-sm">Chưa có món trong danh mục này</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {filteredItems.map((item, index) => (
              <Link 
                to={`/menu/${item.id}`} 
                key={item.id} 
                className="group reveal-up"
                style={{ transitionDelay: `${(index % 6) * 100}ms` }}
              >
                <div className="menu-card rounded-xl overflow-hidden relative transition-all duration-700 hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(212,175,55,0.08)]">
                  {/* Image wrapper */}
                  <div className="aspect-[4/5] md:aspect-[3/4] relative overflow-hidden bg-[#111]">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent"></div>
                    
                    {/* Add to Cart Hover Reveal */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-20">
                      <button 
                        onClick={(e) => handleAddToCart(item, e)}
                        className="w-full py-4 bg-gold text-[#0a0a0a] text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white transition-colors duration-300 shadow-xl"
                      >
                        Thêm Vào Giỏ
                      </button>
                    </div>
                  </div>

                  {/* Content below image inside the card */}
                  <div className="p-8 relative z-10 bg-gradient-to-t from-[#0a0a0a] to-transparent -mt-20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] uppercase tracking-[0.4em] text-gold/70">{item.tag}</span>
                      <span className="text-xl font-light text-white group-hover:text-gold transition-colors duration-300">
                        ${(item.price).toFixed(2)}
                      </span>
                    </div>
                    
                    <h3 className="font-display text-2xl md:text-3xl text-white mb-4 group-hover:text-gold-gradient transition-all duration-500">
                      {item.name}
                    </h3>
                    
                    <p className="text-white/40 text-xs leading-loose line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Aesthetic Spacer */}
      <div className="max-w-4xl mx-auto text-center py-20 border-t border-white/5 reveal-up">
        <h4 className="font-display text-3xl italic text-white/80 mb-6">"Hương vị gọi mời, tinh hoa hội tụ"</h4>
        <div className="w-2 h-2 rounded-full bg-gold mx-auto"></div>
      </div>

    </div>
  );
}

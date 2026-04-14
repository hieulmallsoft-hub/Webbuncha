import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getCategories, getProducts } from "../lib/api.js";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

const normalizePrice = (value) => {
  if (value === null || value === undefined) return 0;
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
    description: item.description || "Hương vị truyền thống bún chả quê hương, nướng than hoa thơm nức lòng.",
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
      message: `${item.name} đã sẵn sàng phục vụ.`
    });
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen text-[#1A1A1A] font-sans w-full overflow-hidden">
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .reveal-up {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .reveal-up.is-visible { opacity: 1; transform: translateY(0); }
          .menu-card {
            background: #FFFFFF;
            border: 1px solid #F0EBE1;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
            transition: all 0.5s ease;
          }
          .menu-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(106, 123, 83, 0.12);
            border-color: #6A7B53;
          }
          .hero-parallax {
            background-image: url('/images/z7699820424452_f8d7ab08e70eeb92e0f51c7d1a7c1b76.jpg');
            background-attachment: fixed;
            background-position: center;
            background-size: cover;
          }
          .category-tab {
            position: relative;
            transition: all 0.3s ease;
          }
          .category-tab::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 50%;
            width: 0;
            height: 2px;
            background: #6A7B53;
            transition: all 0.3s ease;
            transform: translateX(-50%);
          }
          .category-tab.active::after { width: 100%; }
        `}
      </style>

      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 hero-parallax transform scale-105 filter brightness-[0.7] sepia-[0.2]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#FDFBF7]"></div>
        
        <div className="relative z-10 text-center px-4 mt-12 reveal-up">
          <span className="text-[10px] uppercase tracking-[0.5em] text-white/90 font-bold mb-4 block drop-shadow-md">
            Hương Vị Đồng Quê
          </span>
          <h2 className="font-display text-4xl md:text-7xl text-white mb-4 uppercase tracking-[0.2em] font-bold drop-shadow-lg">
            Thực Đơn
          </h2>
          <div className="w-16 h-1 bg-[#6A7B53] mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Category Navigation */}
      <div className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#F0EBE1] py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex gap-6 md:gap-10 overflow-x-auto hide-scrollbar snap-x items-center justify-start md:justify-center">
            <button
              onClick={() => setActiveCategory("All")}
              className={`category-tab snap-start whitespace-nowrap text-[10px] uppercase tracking-[0.3em] font-bold py-2 ${
                activeCategory === "All" ? "text-[#6A7B53] active" : "text-[#1A1A1A]/50 hover:text-[#1A1A1A]"
              }`}
            >
              Mẹt Đặc Sản
            </button>
            {categoryList.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`category-tab snap-start whitespace-nowrap text-[10px] uppercase tracking-[0.3em] font-bold py-2 ${
                  activeCategory === category ? "text-[#6A7B53] active" : "text-[#1A1A1A]/50 hover:text-[#1A1A1A]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
            <div className="w-10 h-10 border-4 border-[#6A7B53] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#6A7B53] tracking-[0.2em] uppercase text-[10px] font-bold">Đang lên món...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 reveal-up">
            <p className="font-bold">{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-32 reveal-up">
            <p className="text-[#1A1A1A]/40 uppercase tracking-[0.2em] text-xs font-bold">Đầu bếp đang cập nhật mục này...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {filteredItems.map((item, index) => (
              <Link 
                to={`/menu/${item.id}`} 
                key={item.id} 
                className="group reveal-up"
                style={{ transitionDelay: `${(index % 6) * 100}ms` }}
              >
                <div className="menu-card rounded-2xl overflow-hidden flex flex-col h-full">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#FAFAFA]">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 filter sepia-[0.1]"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#6A7B53]/90 text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg backdrop-blur-sm">
                        {item.tag}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-display text-2xl md:text-3xl text-[#1A1A1A] font-bold group-hover:text-[#6A7B53] transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                    </div>
                    
                    <p className="text-[#B8860B] font-bold text-lg mb-4">
                      ${item.price.toFixed(2)}
                    </p>
                    
                    <p className="text-[#1A1A1A]/60 text-xs md:text-sm leading-relaxed line-clamp-3 mb-8 bg-[#FAFAFA] p-3 rounded-xl border border-[#F0EBE1] font-medium flex-grow">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#F0EBE1]">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/40 group-hover:text-[#6A7B53] transition-colors">
                        Xem chi tiết →
                      </span>
                      <button 
                        onClick={(e) => handleAddToCart(item, e)}
                        className="bg-[#6A7B53] text-white p-2.5 rounded-full hover:bg-[#1C2B1C] transition-all transform hover:scale-110 shadow-md"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Decorative Bottom */}
      <div className="mx-auto max-w-4xl text-center py-20 border-t border-[#F0EBE1] reveal-up mb-20 px-4">
        <h4 className="font-display text-2xl md:text-4xl italic text-[#1A1A1A]/80 mb-6"> "Cơm quê, bún chả, đậm đà tình thân"</h4>
        <div className="w-1.5 h-12 bg-gradient-to-b from-[#6A7B53] to-transparent mx-auto rounded-full"></div>
      </div>
    </div>
  );
}

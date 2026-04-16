import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getCategories, getProducts } from "../lib/api.js";
import { formatPriceVND } from "../utils/price.js";

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

  const normalizedItems = useMemo(() => items.map((item, index) => ({
    id: item.id,
    setNumber: index + 1,
    name: item.name,
    description: item.description || "Hương vị truyền thống bún chả quê hương, nướng than hoa thơm nức lòng.",
    price: normalizePrice(item.price),
    category: item.categoryName || "Khác",
    imageUrl: item.imageUrl || "/images/z7699818644305_2d4593c168855b379e693ea8a463137d.jpg",
    tag: item.categoryName || "Đậm vị - Thơm ngon - Chuẩn 5 sao",
    kcal: Math.floor(Math.random() * (450 - 350 + 1)) + 350 // random 350-450 kcal for demo if not in db
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
      message: `${item.name} đã được thêm vào giỏ hàng.`
    });
  };

  return (
    <div className="bg-[#FDF5E6] min-h-screen text-[#3E2723] font-sans w-full overflow-hidden selection:bg-[#C84B31] selection:text-white">
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
          .set-card {
            background: linear-gradient(to right, #FFFDF8 0%, #FAF3E8 100%);
            border: 2px solid #E8D8C8;
            border-radius: 20px;
            box-shadow: inset 0 0 15px rgba(200, 75, 49, 0.05), 0 10px 25px rgba(0, 0, 0, 0.03);
            position: relative;
            transition: all 0.4s ease;
          }
          .set-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(200, 75, 49, 0.15);
            border-color: rgba(200, 75, 49, 0.3);
          }
          .number-badge {
            background: linear-gradient(135deg, #FDF5E6 0%, #E8D8C8 100%);
            border: 2px solid #D97706;
            box-shadow: 0 4px 10px rgba(217, 119, 6, 0.2);
          }
          .custom-check {
            width: 16px;
            height: 16px;
            fill: #C84B31;
            margin-right: 8px;
            flex-shrink: 0;
            margin-top: 4px;
          }
          .hero-parallax {
            background-image: url('/images/z7699820424452_f8d7ab08e70eeb92e0f51c7d1a7c1b76.jpg');
            background-attachment: fixed;
            background-position: center;
            background-size: cover;
          }
        `}
      </style>

      {/* Hero Section */}
      <section className="relative h-[30vh] md:h-[40vh] flex items-center justify-center overflow-hidden border-b-[6px] border-[#C84B31]">
        <div className="absolute inset-0 hero-parallax transform scale-105 filter brightness-[0.7] sepia-[0.35] transition-transform duration-[10s] hover:scale-110"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#2E1503]/70 via-[#2E1503]/30 to-[#FDF5E6]"></div>
        
        <div className="relative z-10 text-center px-4 mt-8 reveal-up">
          <p className="text-[10px] md:text-sm uppercase tracking-[0.5em] text-[#FDF5E6] font-bold mb-4 drop-shadow-md">
            Hương Vị Đồng Quê
          </p>
          <h2 className="font-display text-4xl md:text-6xl text-[#FDF5E6] font-bold drop-shadow-lg tracking-widest uppercase">
            Thực Đơn <span className="text-[#D97706]">Chính Hương</span>
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-[#C84B31] to-transparent mx-auto rounded-full mt-6"></div>
        </div>
      </section>

      {/* Category Navigation */}
      <div className="sticky top-[72px] md:top-[88px] z-40 bg-[#FFFDF8]/95 backdrop-blur-xl border-b border-[#E8D8C8] py-4 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex gap-4 md:gap-8 overflow-x-auto hide-scrollbar snap-x items-center justify-start md:justify-center">
            <button
              onClick={() => setActiveCategory("All")}
              className={`snap-start whitespace-nowrap text-[10px] md:text-xs uppercase font-extrabold py-2.5 px-6 rounded-full transition-all duration-300 shadow-sm ${
                activeCategory === "All" ? "bg-[#C84B31] text-white ring-2 ring-[#C84B31]/40 ring-offset-2 ring-offset-[#FFFDF8]" : "bg-white text-[#3E2723] hover:bg-[#FAF3E8] hover:text-[#C84B31] border border-[#E8D8C8]"
              }`}
            >
              Tất Cả Mẹt Món
            </button>
            {categoryList.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`snap-start whitespace-nowrap text-[10px] md:text-xs uppercase font-extrabold py-2.5 px-6 rounded-full transition-all duration-300 shadow-sm ${
                  activeCategory === category ? "bg-[#C84B31] text-white ring-2 ring-[#C84B31]/40 ring-offset-2 ring-offset-[#FFFDF8]" : "bg-white text-[#3E2723] hover:bg-[#FAF3E8] hover:text-[#C84B31] border border-[#E8D8C8]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="max-w-4xl mx-auto px-4 md:px-0 py-12 md:py-20 relative">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] pointer-events-none"></div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[40vh] relative z-10">
            <div className="w-12 h-12 border-4 border-[#C84B31]/30 border-t-[#C84B31] rounded-full animate-spin mb-4 shadow-md"></div>
            <p className="text-[#C84B31] font-bold uppercase tracking-widest text-xs">Đang nướng than hoa...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-[#C84B31] font-bold text-lg reveal-up relative z-10">
            <p>{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 reveal-up relative z-10 bg-[#FFFDF8] rounded-3xl border border-[#E8D8C8] shadow-sm max-w-2xl mx-auto">
            <span className="text-5xl mb-4 block">🔥</span>
            <p className="text-[#3E2723]/60 font-bold">Lò than đang bận, chưa có món mới trong danh mục này.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8 md:gap-10 relative z-10">
            {filteredItems.map((item, index) => (
              <Link 
                to={`/menu/${item.id}`} 
                key={item.id} 
                className="group reveal-up block relative"
                style={{ transitionDelay: `${(index % 6) * 100}ms` }}
              >
                <div className="set-card flex flex-col md:flex-row min-h-[180px] bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] overflow-hidden">
                  
                  {/* Left Content */}
                  <div className="flex-1 p-5 md:p-8 pl-8 md:pl-12 relative flex flex-col justify-center">
                    
                    {/* Badge */}
                    <div className="absolute -top-4 -left-4 md:-left-6 w-14 h-14 md:w-16 md:h-16 number-badge rounded-full flex items-center justify-center z-10">
                      <span className="text-2xl md:text-3xl font-black text-[#D97706] drop-shadow-sm">{item.setNumber}</span>
                      {/* Ribbon decoration */}
                      <div className="absolute -bottom-2 -left-2 w-0 h-0 border-t-8 border-t-[#C84B31] border-r-8 border-r-transparent border-l-8 border-l-transparent transform -rotate-45"></div>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-2xl md:text-3xl text-[#3E2723] font-black mb-4 ml-4 md:ml-2 tracking-wide group-hover:text-[#C84B31] transition-colors duration-300">
                      Mẹt Món {item.setNumber}: <br className="hidden md:block" /><span className="text-[#C84B31]">{item.name}</span>
                    </h3>
                    
                    {/* Description List */}
                    <div className="space-y-3 mb-6">
                      {item.description.split(',').map((descPart, i) => (
                        <div key={i} className="flex items-start">
                          <svg className="custom-check" viewBox="0 0 24 24">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          <span className="text-[#3E2723]/90 font-medium text-sm md:text-base leading-tight">
                            {descPart.trim()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Price and Kcal Box */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <div className="bg-[#FAF3E8] border border-[#E8D8C8] text-[#3E2723] text-sm md:text-base font-bold px-4 py-1.5 rounded-lg flex items-center shadow-sm">
                        <svg className="w-5 h-5 mr-2 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Khẩu phần {item.kcal > 400 ? "Lớn" : "Vừa"}
                      </div>
                      <div className="bg-gradient-to-r from-[#D97706] to-[#C84B31] text-white text-base md:text-xl font-black px-5 py-1.5 rounded-lg shadow-md border-b-2 border-b-[#A03520]">
                        {formatPriceVND(item.price)}
                      </div>
                    </div>

                    {/* Footer Badge */}
                    <div className="inline-flex flex-wrap items-center gap-2 text-xs md:text-sm text-[#C84B31] font-bold bg-[#C84B31]/5 px-3 py-1.5 rounded-md border border-[#C84B31]/10 w-fit">
                      <div className="w-2 h-2 rounded-full bg-[#C84B31] animate-pulse"></div>
                      {item.tag}
                    </div>

                    {/* Add to Cart button overlapping slightly */}
                    <button 
                      onClick={(e) => handleAddToCart(item, e)}
                      className="absolute bottom-6 right-6 md:-right-6 bg-gradient-to-r from-[#C84B31] to-[#D97706] text-[#FDF5E6] p-3 rounded-xl hover:scale-105 transition-all shadow-[0_10px_20px_rgba(200,75,49,0.3)] z-20 flex items-center justify-center filter drop-shadow-md group/btn"
                    >
                      <svg className="w-6 h-6 transform group-hover/btn:-rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Right Image */}
                  <div className="md:w-[35%] w-full h-[240px] md:h-auto overflow-hidden relative border-l-2 border-[#E8D8C8]/60 bg-[#2D1A11]">
                    <div className="absolute inset-0 bg-[#A03520] mix-blend-color opacity-20 group-hover:opacity-10 transition-opacity z-10 pointer-events-none"></div>
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover transform transition-transform duration-[1.5s] group-hover:scale-110 filter sepia-[0.1] contrast-[1.1] brightness-[0.95]"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}


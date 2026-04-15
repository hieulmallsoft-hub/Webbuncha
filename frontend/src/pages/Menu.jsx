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
    <div className="bg-[#EAF3DE] min-h-screen text-[#1A1A1A] font-sans w-full overflow-hidden">
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
            background: linear-gradient(to right, rgba(255, 255, 255, 0.95), #FAFDED);
            border: 2px solid #84A367;
            border-radius: 12px;
            box-shadow: inset 0 0 10px rgba(132, 163, 103, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
            position: relative;
            transition: all 0.3s ease;
          }
          .set-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(132, 163, 103, 0.2);
          }
          .number-badge {
            background: radial-gradient(circle, #FDE68A 0%, #F59E0B 100%);
            border: 2px solid #B45309;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .custom-check {
            width: 16px;
            height: 16px;
            fill: #166534;
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
      <section className="relative h-[30vh] md:h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 hero-parallax transform scale-105 filter brightness-[0.7]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#166534]/70 via-[#166534]/30 to-[#EAF3DE]"></div>
        
        <div className="relative z-10 text-center px-4 mt-8 reveal-up">
          <h2 className="font-display text-4xl md:text-6xl text-white font-bold drop-shadow-md tracking-wider">
            THỰC ĐƠN ĐẶC BIỆT
          </h2>
          <div className="w-24 h-1.5 bg-[#FDE68A] mx-auto rounded-full mt-4"></div>
        </div>
      </section>

      {/* Category Navigation */}
      <div className="sticky top-0 z-40 bg-[#EAF3DE]/95 backdrop-blur-md border-b-2 border-[#84A367]/30 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex gap-4 md:gap-8 overflow-x-auto hide-scrollbar snap-x items-center justify-start md:justify-center">
            <button
              onClick={() => setActiveCategory("All")}
              className={`snap-start whitespace-nowrap text-xs md:text-sm uppercase font-bold py-2 px-4 rounded-full transition-all ${
                activeCategory === "All" ? "bg-[#166534] text-white shadow-md" : "bg-white text-[#166534] hover:bg-[#84A367] hover:text-white border border-[#166534]"
              }`}
            >
              Tất Cả
            </button>
            {categoryList.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`snap-start whitespace-nowrap text-xs md:text-sm uppercase font-bold py-2 px-4 rounded-full transition-all ${
                  activeCategory === category ? "bg-[#166534] text-white shadow-md" : "bg-white text-[#166534] hover:bg-[#84A367] hover:text-white border border-[#166534]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="max-w-4xl mx-auto px-4 md:px-0 py-10 md:py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
            <div className="w-10 h-10 border-4 border-[#166534] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#166534] font-bold">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 font-bold text-lg reveal-up">
            <p>{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 reveal-up">
            <p className="text-[#166534]/60 font-bold">Chưa có món trong danh mục này.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 md:gap-8">
            {filteredItems.map((item, index) => (
              <Link 
                to={`/menu/${item.id}`} 
                key={item.id} 
                className="group reveal-up block relative"
                style={{ transitionDelay: `${(index % 6) * 100}ms` }}
              >
                <div className="set-card flex flex-col md:flex-row min-h-[180px]">
                  
                  {/* Left Content */}
                  <div className="flex-1 p-4 md:p-6 pl-6 md:pl-10 relative">
                    
                    {/* Badge */}
                    <div className="absolute -top-3 -left-3 md:-left-5 w-12 h-12 md:w-14 md:h-14 number-badge rounded-full flex items-center justify-center z-10">
                      <span className="text-xl md:text-2xl font-black text-[#B45309] drop-shadow-sm">{item.setNumber}</span>
                      {/* Ribbon decoration */}
                      <div className="absolute -bottom-2 -left-2 w-0 h-0 border-t-8 border-t-red-600 border-r-8 border-r-transparent border-l-8 border-l-transparent transform -rotate-45"></div>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-xl md:text-2xl text-[#C2410C] font-extrabold mb-3 ml-6 md:ml-4 tracking-wide">
                      Món {item.setNumber}: {item.name}
                    </h3>
                    
                    {/* Description List */}
                    <div className="space-y-2 mb-4">
                      {item.description.split(',').map((descPart, i) => (
                        <div key={i} className="flex items-start">
                          <svg className="custom-check" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                          <span className="text-[#1A1A1A] font-semibold text-sm md:text-base leading-tight">
                            {descPart.trim()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Price and Kcal Box */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <div className="bg-[#166534] text-white text-sm md:text-base font-bold px-3 py-1 rounded-sm flex items-center shadow-md">
                        <svg className="w-5 h-5 mr-1 text-[#FDE68A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        ~ {item.kcal} kcal
                      </div>
                      <div className="bg-[#FEF08A] text-[#B45309] text-base md:text-lg font-black px-4 py-1 rounded-sm border border-[#FDE047] shadow-md">
                        {formatPriceVND(item.price)}
                      </div>
                    </div>

                    {/* Footer Badge */}
                    <div className="inline-flex flex-wrap items-center gap-1.5 text-sm md:text-base text-[#166534] font-bold">
                      <div className="bg-[#22C55E] rounded-full p-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {item.tag}
                    </div>

                    {/* Add to Cart button overlapping slightly */}
                    <button 
                      onClick={(e) => handleAddToCart(item, e)}
                      className="absolute bottom-4 right-4 md:-right-6 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white p-2.5 rounded-full hover:scale-110 transition-transform shadow-lg z-20"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Right Image */}
                  <div className="md:w-[35%] w-full h-[200px] md:h-auto p-4 md:p-3 flex items-center justify-center">
                    <div className="w-full h-full md:w-[220px] md:h-[220px] rounded-full overflow-hidden border-4 border-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] bg-white">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover transform transition-transform duration-[1.5s] group-hover:scale-110 group-hover:rotate-3"
                      />
                    </div>
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


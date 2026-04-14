import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import ItemDetail from "./pages/ItemDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Account from "./pages/Account.jsx";
import Orders from "./pages/Orders.jsx";
import Reviews from "./pages/Reviews.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";
import AdminRoutes from "./admin/AdminRoutes.jsx";
import { getProducts } from "./lib/api.js";

const fallbackPreview = [
  { name: "Bún chả viên", desc: "Chả viên nướng thơm, bún rối", price: "6.0" },
  { name: "Bún chả lẫn", desc: "Chả viên và thịt nướng", price: "7.0" },
  { name: "Bún chả thịt nướng", desc: "Thịt nướng vàng cạnh, thơm khói", price: "7.5" },
  { name: "Nem rán", desc: "Nem vàng giòn, nhân thịt mộc nhĩ", price: "3.5" },
  { name: "Bánh bột lọc", desc: "Bánh dẻo, nhân đậm vị", price: "3.0" },
  { name: "Thịt trưng mắm tép", desc: "Thịt băm rim mắm tép", price: "4.0" }
];

function IntroScreen({ onEnter, exiting }) {
  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-midnight transition-all duration-1000 ${exiting ? "opacity-0 scale-110 pointer-events-none" : "opacity-100"}`}>
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      <div className="relative text-center z-10 px-6 max-w-2xl">
        <div className="mb-8 overflow-hidden">
          <p className="text-[10px] uppercase tracking-[0.6em] text-gold/60 animate-pulse">Since 1992</p>
        </div>
        
        <h1 className="font-display text-4xl md:text-6xl text-white mb-12 tracking-[0.2em] uppercase reveal-text">
          Bún Chả <br /> <span className="text-gold italic tracking-normal capitalize">Chinh Hương</span>
        </h1>
        
        <div className="w-24 h-px bg-gold/30 mx-auto mb-16"></div>
        
        <button 
          onClick={onEnter}
          className="group relative px-12 py-5 border border-white/10 hover:border-gold transition-all duration-700 overflow-hidden"
        >
          <span className="relative z-10 text-[10px] uppercase tracking-[0.5em] text-white group-hover:text-midnight transition-colors duration-700">Bước vào không gian</span>
          <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out"></div>
        </button>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40">
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-gold"></div>
        <span className="text-[8px] uppercase tracking-[0.5em] text-white/50">Scroll to explore</span>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const [entered, setEntered] = useState(() => sessionStorage.getItem("mt_entered") === "true");
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    window.setTimeout(() => {
      sessionStorage.setItem("mt_entered", "true");
      setEntered(true);
    }, 1000);
  };

  if (!entered && !location.pathname.startsWith("/admin")) {
    return <IntroScreen onEnter={handleEnter} exiting={exiting} />;
  }

  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/menu/:id" element={<ItemDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<Account />} />
              <Route path="/history" element={<Orders />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getProductById } from "../lib/api.js";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

const normalizePrice = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }
  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
};

export default function ItemDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const res = await getProductById(id);
      if (!active) return;
      if (res.status >= 200 && res.status < 300) {
        const data = res.data?.data;
        if (data) {
          setItem({
            id: data.id,
            name: data.name,
            description: data.description || "Chưa có mô tả.",
            price: normalizePrice(data.price),
            category: data.categoryName || "Khác",
            tag: data.categoryName || "Món mới",
            mood: "Tươi ngon",
            imageUrl: data.imageUrl || ""
          });
        } else {
          setItem(null);
        }
      } else {
        setItem(null);
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="slide-deck">
        <div className="slide ml-section">
          <LoadingOverlay variant="page" label="Đang lên bếp món ăn..." />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="ml-section">
        <h3 className="font-display text-2xl">Không tìm thấy món ăn</h3>
        <Link className="mt-4 inline-block text-sm font-semibold text-ember" to="/menu">
          Quay lại thực đơn
        </Link>
      </div>
    );
  }

  return (
    <div className="slide-deck">
      <section
        className="slide slide-hero ml-page-hero"
        style={{
          backgroundImage: `url(${item.imageUrl || "/images/z7699819283762_3634071596ff124321b8dd68e057bc54.jpg"})`
        }}
      >
        <div className="ml-page-hero-content">
          <p className="ml-breadcrumb">Trang chủ / Thực đơn / Chi tiết</p>
          <h2 className="font-display ml-hero-title">{item.name}</h2>
          <p className="ml-hero-subtitle">{item.description}</p>
        </div>
      </section>

      <div className="slide grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="ml-section">
          <span className="ml-label">{item.tag}</span>
          <h2 className="mt-3 font-display text-3xl">{item.name}</h2>
          <p className="mt-3 text-sm text-ink/70">{item.description}</p>
          <div className="mt-4 flex gap-4 text-sm text-ink/60">
            <span>{item.category}</span>
            <span>{item.mood}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="ml-button"
              type="button"
              onClick={() => {
                addItem(item);
                addToast({
                  type: "success",
                  title: "Đã thêm vào giỏ",
                  message: item.name
                });
              }}
            >
              Thêm vào giỏ - ${item.price.toFixed(2)}
            </button>
            <Link className="ml-button-outline" to="/menu">
              Quay lại thực đơn
            </Link>
          </div>
        </div>
        <div className="ml-dark">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Gợi ý</p>
          <h3 className="mt-3 font-display text-xl">Kết hợp hương vị</h3>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
            <li>Ngon hơn khi ăn kèm rau sống và dưa góp.</li>
            <li>Thời gian phục vụ dự kiến: 12 phút.</li>
            <li>Thành phần có thể chứa đậu phộng và hải sản.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

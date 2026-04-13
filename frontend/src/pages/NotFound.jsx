import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="slide-deck">
      <div className="slide ml-section">
        <p className="ml-label">404</p>
        <h3 className="mt-3 font-display text-2xl">Không tìm thấy trang</h3>
        <p className="mt-2 text-sm text-ink/70">Đường dẫn không tồn tại. Quay về thực đơn.</p>
        <Link className="mt-5 inline-block ml-button" to="/menu">
          Về thực đơn
        </Link>
      </div>
    </div>
  );
}

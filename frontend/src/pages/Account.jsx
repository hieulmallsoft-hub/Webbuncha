import { getProfileFromToken, getProfileName } from "../lib/auth.js";

export default function Account() {
  const profile = getProfileFromToken();
  const name = getProfileName() || "Guest";

  return (
    <div className="slide-deck">
      <section
        className="slide slide-hero ml-page-hero"
        style={{
          backgroundImage:
            "url(/images/z7699819298138_5ea6bacf9d760fe5a02bd43fc7c1569b.jpg)"
        }}
      >
        <div className="ml-page-hero-content">
          <p className="ml-breadcrumb">Trang chủ / Tài khoản</p>
          <h2 className="font-display ml-hero-title">Tài khoản</h2>
          <p className="ml-hero-subtitle">Quản lý thông tin cá nhân và lịch sử giao dịch.</p>
        </div>
      </section>

      <div className="slide ml-section">
        <p className="ml-label">Tổng quan</p>
        <h3 className="mt-3 font-display text-2xl">Hồ sơ cá nhân</h3>
        <p className="mt-2 text-sm text-ink/70">{profile ? "Đang hoạt động" : "Chưa đăng nhập"}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="ml-card">
            <h4 className="font-display text-xl">Thông tin</h4>
            <p className="mt-2 text-sm text-ink/70">Tên: {name}</p>
            <p className="text-sm text-ink/70">Email: {profile?.email || "-"}</p>
            <p className="text-sm text-ink/70">
              Vai trò: {profile?.roles?.length ? profile.roles.join(", ") : "-"}
            </p>
            <p className="text-sm text-ink/70">
              Hết hạn: {profile?.expiresAt ? profile.expiresAt.toLocaleString() : "-"}
            </p>
          </div>
          <div className="ml-card">
            <h4 className="font-display text-xl">Ưu đãi</h4>
            <p className="mt-2 text-sm text-ink/70">Tích điểm và ưu đãi sẽ cập nhật trong thời gian tới.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

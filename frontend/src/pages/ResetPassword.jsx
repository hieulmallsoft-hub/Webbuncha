import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../lib/api.js";

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const query = useQuery();
  const initialPhone = query.get("phone") || "";

  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const isError = useMemo(() => {
    const value = status.toLowerCase();
    return value.includes("thất bại") || value.includes("lỗi") || value.includes("không");
  }, [status]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus("Đang cập nhật mật khẩu...");
    const res = await resetPassword({ phone, otp, newPassword });
    setLoading(false);
    if (res.status >= 200 && res.status < 300) {
      setStatus(res.data?.message || "Đặt lại mật khẩu thành công.");
      setTimeout(() => navigate("/login", { state: { message: "Đặt lại mật khẩu thành công. Mời bạn đăng nhập." } }), 800);
      return;
    }
    setStatus(res.data?.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 font-sans text-[#1A1A1A]">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#F0EBE1] shadow-xl p-8">
        <div className="mb-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] font-extrabold text-[#6A7B53] hover:text-[#1A1A1A] transition-colors"
          >
            ← Quay lại đăng nhập
          </Link>
          <h1 className="mt-6 font-display text-3xl font-bold">Đặt lại mật khẩu</h1>
          <p className="mt-2 text-sm text-[#1A1A1A]/60">
            Nhập số điện thoại, OTP 6 số và mật khẩu mới.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/40 font-extrabold ml-1">
              Phone
            </label>
            <input
              inputMode="tel"
              className="w-full bg-white border border-[#F0EBE1] rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-[#6A7B53]"
              placeholder="+84901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/40 font-extrabold ml-1">
              OTP (6 số)
            </label>
            <input
              inputMode="numeric"
              className="w-full bg-white border border-[#F0EBE1] rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-[#6A7B53] tracking-[0.35em] text-center"
              placeholder="______"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/40 font-extrabold ml-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              className="w-full bg-white border border-[#F0EBE1] rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-[#6A7B53]"
              placeholder="Ít nhất 8 ký tự"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.4em] font-extrabold hover:bg-[#6A7B53] transition-all duration-500 shadow-xl rounded-xl disabled:opacity-60"
          >
            {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </form>

        {status && (
          <div
            className={`mt-6 p-4 rounded-xl border ${
              isError
                ? "bg-red-50 border-red-100 text-red-600"
                : "bg-[#6A7B53]/5 border-[#6A7B53]/10 text-[#6A7B53]"
            } text-[10px] font-bold uppercase tracking-widest text-center`}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
